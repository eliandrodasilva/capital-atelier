package com.capitalatelier.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.capitalatelier.api.dto.AddMemberRequestDTO;
import com.capitalatelier.api.dto.UpdateMemberRoleDTO;
import com.capitalatelier.api.dto.WalletMemberResponseDTO;
import com.capitalatelier.api.dto.WalletRequestDTO;
import com.capitalatelier.api.dto.WalletResponseDTO;
import com.capitalatelier.api.enums.WalletRole;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.model.WalletMember;
import com.capitalatelier.api.repository.UserRepository;
import com.capitalatelier.api.repository.WalletMemberRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletMemberRepository walletMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityUtils securityUtils;

    public List<WalletResponseDTO> getWallets() {
        User user = securityUtils.getAuthenticatedUser();
        List<Wallet> wallets = walletRepository.findAllAccessibleByUser(user.getId());

        return wallets.stream().map(w -> toWalletDTO(w, user.getId())).toList();
    }

    public WalletResponseDTO createWallet(WalletRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();

        Wallet wallet = new Wallet();
        wallet.setOwner(user);
        wallet.setName(dto.name());
        wallet.setDescription(dto.description());

        Wallet saved = walletRepository.save(wallet);

        WalletMember ownerMember = new WalletMember();
        ownerMember.setWallet(saved);
        ownerMember.setUser(user);
        ownerMember.setRole(WalletRole.OWNER);

        walletMemberRepository.save(ownerMember);

        return toWalletDTO(saved, user.getId());
    }

    public WalletResponseDTO getWallet(Long id) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkMemberAccess(wallet, user.getId());

        return toWalletDTO(wallet, user.getId());
    }

    public WalletResponseDTO updateWallet(Long id, WalletRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkOwnerAccess(wallet, user.getId());

        wallet.setName(dto.name());
        wallet.setDescription(dto.description());

        return toWalletDTO(walletRepository.save(wallet), user.getId());
    }

    public void deleteWallet(Long id) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkOwnerAccess(wallet, user.getId());

        walletRepository.delete(wallet);
    }

    public List<WalletMemberResponseDTO> getMembers(Long walletId) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkMemberAccess(wallet, user.getId());

        return walletMemberRepository.findByWalletId(walletId).stream()
            .map(this::toMemberDTO)
            .toList();
    }

    public WalletMemberResponseDTO addMember(Long walletId, AddMemberRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkOwnerAccess(wallet, user.getId());

        User memberUser = userRepository.findByEmail(dto.email())
            .orElseThrow(() -> new RuntimeException("Usuário com o email informado não foi encontrado"));

        if (walletMemberRepository.existsByWalletIdAndUserId(walletId, memberUser.getId())) {
            throw new DataIntegrityViolationException("Este usuário já é membro da carteira");
        }

        WalletMember member = new WalletMember();
        member.setWallet(wallet);
        member.setUser(memberUser);
        member.setRole(dto.role());

        return toMemberDTO(walletMemberRepository.save(member));
    }

    public WalletMemberResponseDTO updateMemberRole(Long walletId, Long targetUserId, UpdateMemberRoleDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkOwnerAccess(wallet, user.getId());

        WalletMember member = walletMemberRepository.findByWalletIdAndUserId(walletId, targetUserId)
            .orElseThrow(() -> new RuntimeException("Membro não encontrado na carteira"));

        member.setRole(dto.role());

        return toMemberDTO(walletMemberRepository.save(member));
    }

    public void removeMember(Long walletId, Long targetUserId) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        checkOwnerAccess(wallet, user.getId());

        if (wallet.getOwner().getId().equals(targetUserId)) {
            throw new RuntimeException("Não é possível remover o proprietário da carteira");
        }

        walletMemberRepository.deleteByWalletIdAndUserId(walletId, targetUserId);
    }

    public void checkOwnerAccess(Wallet wallet, Long userId) {
        if (!wallet.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Somente o proprietário (OWNER) pode realizar esta operação");
        }
    }

    public WalletRole getUserRole(Wallet wallet, Long userId) {
        if (wallet.getOwner().getId().equals(userId)) {
            return WalletRole.OWNER;
        }
        return walletMemberRepository.findByWalletIdAndUserId(wallet.getId(), userId)
            .map(WalletMember::getRole)
            .orElse(null);
    }

    public void checkMemberAccess(Wallet wallet, Long userId) {
        if (getUserRole(wallet, userId) == null) {
            throw new RuntimeException("Você não tem acesso a esta carteira");
        }
    }

    public void checkCanWriteTransaction(Wallet wallet, Long userId) {
        WalletRole role = getUserRole(wallet, userId);
        if (role == null || role == WalletRole.VIEWER) {
            throw new RuntimeException("Apenas OWNER ou EDITOR podem criar, editar ou excluir transações");
        }
    }

    private WalletResponseDTO toWalletDTO(Wallet wallet, Long userId) {
        WalletRole role = getUserRole(wallet, userId);
        return new WalletResponseDTO(
            wallet.getId(),
            wallet.getName(),
            wallet.getDescription(),
            wallet.getOwner().getId(),
            wallet.getOwner().getUsername(),
            role != null ? role : WalletRole.VIEWER,
            wallet.getCreatedAt());
    }

    private WalletMemberResponseDTO toMemberDTO(WalletMember member) {
        return new WalletMemberResponseDTO(
            member.getId(),
            member.getUser().getId(),
            member.getUser().getUsername(),
            member.getUser().getEmail(),
            member.getRole(),
            member.getJoinedAt());
    }
}
