package com.capitalatelier.api.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.capitalatelier.api.enums.WalletRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "wallet_members", uniqueConstraints = { @UniqueConstraint(columnNames = { "wallet_id", "user_id" }) })
@Data
public class WalletMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    @NotNull(message = "A carteira é obrigatória")
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @NotNull(message = "O usuário membro é obrigatório")
    private User user;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O papel do membro é obrigatório")
    private WalletRole role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;
}
