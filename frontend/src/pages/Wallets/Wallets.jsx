import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import WalletService from '@/services/WalletService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AlertMessage from '@/components/ui/AlertMessage';

const ROLE_LABELS = {
  OWNER: 'Proprietário',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
};

const WalletsPage = () => {
  const {
    wallets,
    activeWallet,
    selectWallet,
    refreshWallets,
    loadingWallets,
  } = useOutletContext();

  const [selectedWalletId, setSelectedWalletId] = useState(
    activeWallet?.id ?? null
  );
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [editingWalletId, setEditingWalletId] = useState(null);
  const [walletForm, setWalletForm] = useState({ name: '', description: '' });
  const [savingWallet, setSavingWallet] = useState(false);

  const [inviteForm, setInviteForm] = useState({ email: '', role: 'EDITOR' });
  const [inviting, setInviting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedWallet =
    wallets.find((w) => w.id === selectedWalletId) || activeWallet || null;
  const isSelectedOwner = selectedWallet?.role === 'OWNER';

  const loadMembers = useCallback(async (walletId) => {
    if (!walletId) {
      setMembers([]);
      return;
    }

    setLoadingMembers(true);
    try {
      const res = await WalletService.getMembers(walletId);
      setMembers(res.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível carregar os membros da carteira.'
      );
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedWallet?.id) return;

    let cancelled = false;
    WalletService.getMembers(selectedWallet.id)
      .then((res) => {
        if (!cancelled) {
          setMembers(res.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Não foi possível carregar os membros da carteira.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWallet?.id]);

  const resetWalletForm = () => {
    setEditingWalletId(null);
    setWalletForm({ name: '', description: '' });
  };

  const handleEditWallet = (wallet) => {
    setError('');
    setSuccess('');
    setEditingWalletId(wallet.id);
    setWalletForm({
      name: wallet.name || '',
      description: wallet.description || '',
    });
  };

  const handleSubmitWallet = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!walletForm.name.trim()) {
      setError('O nome da carteira é obrigatório.');
      return;
    }

    setSavingWallet(true);
    try {
      const payload = {
        name: walletForm.name.trim(),
        description: walletForm.description.trim() || null,
      };

      if (editingWalletId) {
        await WalletService.update(editingWalletId, payload);
        setSuccess('Carteira atualizada com sucesso.');
      } else {
        const res = await WalletService.create(payload);
        setSuccess('Carteira criada com sucesso.');
        if (res.data?.id) {
          setSelectedWalletId(res.data.id);
          selectWallet(res.data.id);
        }
      }

      resetWalletForm();
      await refreshWallets();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível salvar a carteira.'
      );
    } finally {
      setSavingWallet(false);
    }
  };

  const handleDeleteWallet = async (walletId) => {
    setError('');
    setSuccess('');
    try {
      await WalletService.delete(walletId);
      setSuccess('Carteira excluída com sucesso.');
      if (selectedWalletId === walletId) {
        setSelectedWalletId(null);
      }
      await refreshWallets();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível excluir a carteira.'
      );
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!selectedWallet) return;

    setError('');
    setSuccess('');

    if (!inviteForm.email.trim()) {
      setError('Informe o e-mail do usuário para convidar.');
      return;
    }

    setInviting(true);
    try {
      await WalletService.addMember(selectedWallet.id, {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      });
      setInviteForm({ email: '', role: 'EDITOR' });
      setSuccess('Membro adicionado à carteira com sucesso.');
      await loadMembers(selectedWallet.id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível adicionar o membro. Verifique se o e-mail está cadastrado.'
      );
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId, nextRole) => {
    if (!selectedWallet) return;
    setError('');
    setSuccess('');
    try {
      await WalletService.updateMemberRole(selectedWallet.id, userId, {
        role: nextRole,
      });
      setSuccess('Permissão do membro atualizada.');
      await loadMembers(selectedWallet.id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível atualizar a permissão do membro.'
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedWallet) return;
    setError('');
    setSuccess('');
    try {
      await WalletService.removeMember(selectedWallet.id, userId);
      setSuccess('Membro removido da carteira.');
      await loadMembers(selectedWallet.id);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível remover o membro.'
      );
    }
  };

  if (loadingWallets) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="text-muted-foreground size-10 animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando carteiras...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Carteiras e compartilhamento
        </h1>
      </header>

      <AlertMessage message={error} variant="error" />
      <AlertMessage message={success} variant="success" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="border-border bg-card text-card-foreground rounded-none border p-6">
          <h2 className="mb-4 text-lg font-medium">
            {editingWalletId ? 'Editar carteira' : 'Nova carteira'}
          </h2>

          <form onSubmit={handleSubmitWallet} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="wallet-name" className="text-muted-foreground">
                Nome
              </Label>
              <Input
                id="wallet-name"
                type="text"
                value={walletForm.name}
                onChange={(e) =>
                  setWalletForm({ ...walletForm, name: e.target.value })
                }
                placeholder="Ex.: Casa Compartilhada"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="wallet-desc" className="text-muted-foreground">
                Descrição
              </Label>
              <Input
                id="wallet-desc"
                type="text"
                value={walletForm.description}
                onChange={(e) =>
                  setWalletForm({ ...walletForm, description: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingWalletId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetWalletForm}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={savingWallet}
                className="flex-1 cursor-pointer"
              >
                {savingWallet
                  ? 'Salvando...'
                  : editingWalletId
                    ? 'Atualizar'
                    : 'Criar carteira'}
              </Button>
            </div>
          </form>
        </section>

        <section className="border-border bg-card text-card-foreground rounded-none border p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium">
            Minhas carteiras ({wallets.length})
          </h2>

          <div className="divide-border divide-y">
            {wallets.map((w) => {
              const isActive = activeWallet?.id === w.id;
              const isSelected = selectedWallet?.id === w.id;
              const isOwner = w.role === 'OWNER';

              return (
                <div
                  key={w.id}
                  className={`flex flex-wrap items-center justify-between gap-4 py-4 ${
                    isSelected ? 'bg-secondary/40 -mx-3 px-3' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{w.name}</p>
                      <span className="border-border bg-secondary text-muted-foreground border px-2 py-0.5 text-[11px] font-medium">
                        {ROLE_LABELS[w.role] || w.role}
                      </span>
                      {isActive && (
                        <span className="border-foreground text-foreground border px-2 py-0.5 text-[11px] font-medium">
                          Ativa
                        </span>
                      )}
                    </div>
                    {w.description && (
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {w.description}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      Proprietário: {w.ownerName || 'Você'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          selectWallet(w.id);
                          setSelectedWalletId(w.id);
                        }}
                        className="cursor-pointer"
                      >
                        Usar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedWalletId(w.id)}
                      className="cursor-pointer"
                    >
                      Membros
                    </Button>
                    {isOwner && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditWallet(w)}
                          aria-label="Editar carteira"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={wallets.length <= 1}
                          onClick={() => handleDeleteWallet(w.id)}
                          aria-label="Excluir carteira"
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {selectedWallet && (
        <section className="border-border bg-card text-card-foreground rounded-none border p-6">
          <h2 className="mb-6 text-lg font-medium">
            Membros de {selectedWallet.name}
          </h2>

          {isSelectedOwner && (
            <form
              onSubmit={handleInviteMember}
              className="border-border bg-secondary/40 mb-6 grid grid-cols-1 gap-4 border p-4 md:grid-cols-4"
            >
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="invite-email" className="text-muted-foreground">
                  E-mail do membro
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="membro@email.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-role" className="text-muted-foreground">
                  Permissão
                </Label>
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                  className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
                >
                  <option value="EDITOR">Editor (lança e edita)</option>
                  <option value="VIEWER">Visualizador (somente leitura)</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={inviting}
                  className="w-full cursor-pointer"
                >
                  {inviting ? 'Convidando...' : 'Adicionar'}
                </Button>
              </div>
            </form>
          )}

          {loadingMembers ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-border bg-secondary text-muted-foreground border-b text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Papel</th>
                    {isSelectedOwner && (
                      <th className="px-4 py-3 text-right">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {members.map((m) => (
                    <tr key={m.userId} className="hover:bg-secondary/60">
                      <td className="px-4 py-3 font-medium">{m.username}</td>
                      <td className="text-muted-foreground px-4 py-3">
                        {m.email}
                      </td>
                      <td className="px-4 py-3">
                        {isSelectedOwner && m.role !== 'OWNER' ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              handleUpdateRole(m.userId, e.target.value)
                            }
                            aria-label={`Permissão de ${m.username}`}
                            className="border-input bg-background text-foreground h-8 rounded-none border px-2 text-xs outline-none"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Visualizador</option>
                          </select>
                        ) : (
                          <span className="border-border bg-secondary text-foreground border px-2 py-0.5 text-xs">
                            {ROLE_LABELS[m.role] || m.role}
                          </span>
                        )}
                      </td>
                      {isSelectedOwner && (
                        <td className="px-4 py-3 text-right">
                          {m.role !== 'OWNER' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveMember(m.userId)}
                              aria-label={`Remover ${m.username}`}
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Nenhum membro encontrado nesta carteira.
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default WalletsPage;
