import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  PlusCircle,
  MinusCircle,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import TransactionService from '@/services/TransactionService';
import CategoryService from '@/services/CategoryService';
import AiService from '@/services/AiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AlertMessage from '@/components/ui/AlertMessage';

const MONOCHROME_COLORS = [
  { label: 'Preto', value: '#171717' },
  { label: 'Cinza escuro', value: '#404040' },
  { label: 'Cinza médio', value: '#737373' },
  { label: 'Cinza claro', value: '#A3A3A3' },
];

function getTodayIso() {
  return new Date().toISOString().split('T')[0];
}

const TransactionsPage = () => {
  const { activeWallet, loadingWallets, canEdit, realtimeVersion } =
    useOutletContext();

  const [activeTab, setActiveTab] = useState('transactions');
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [txForm, setTxForm] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    date: getTodayIso(),
    categoryId: '',
  });
  const [savingTx, setSavingTx] = useState(false);
  const [suggestingCategory, setSuggestingCategory] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#171717',
  });
  const [savingCategory, setSavingCategory] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = await CategoryService.list();
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadTransactions = useCallback(
    async (page = 0) => {
      if (!activeWallet) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const params = {
          page,
          size: 10,
          sort: 'date,desc',
        };
        if (filters.type) params.type = filters.type;
        if (filters.categoryId) params.categoryId = Number(filters.categoryId);
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const res = await TransactionService.list(activeWallet.id, params);
        const data = res.data || {};
        setTransactions(data.content || []);
        setPageInfo({
          page: data.number ?? page,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Não foi possível carregar as transações.'
        );
      } finally {
        setLoading(false);
      }
    },
    [activeWallet, filters]
  );

  useEffect(() => {
    let cancelled = false;
    CategoryService.list()
      .then((res) => {
        if (!cancelled) {
          setCategories(res.data || []);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadingWallets || !activeWallet) return;

    let cancelled = false;
    const params = {
      page: 0,
      size: 10,
      sort: 'date,desc',
    };
    if (filters.type) params.type = filters.type;
    if (filters.categoryId) params.categoryId = Number(filters.categoryId);
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    TransactionService.list(activeWallet.id, params)
      .then((res) => {
        if (cancelled) return;
        const data = res.data || {};
        setError('');
        setTransactions(data.content || []);
        setPageInfo({
          page: data.number ?? 0,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Não foi possível carregar as transações.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadingWallets, activeWallet, filters, realtimeVersion]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);

  const resetTxForm = () => {
    setEditingTxId(null);
    setTxForm({
      type: 'EXPENSE',
      amount: '',
      description: '',
      date: getTodayIso(),
      categoryId: '',
    });
    setShowTxForm(false);
  };

  const handleOpenEditTx = (tx) => {
    setError('');
    setSuccess('');
    setEditingTxId(tx.id);
    setTxForm({
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description || '',
      date: tx.date || getTodayIso(),
      categoryId: tx.categoryId ? String(tx.categoryId) : '',
    });
    setShowTxForm(true);
  };

  const handleSuggestCategory = async () => {
    if (!activeWallet) return;
    setError('');
    setSuccess('');

    if (!txForm.description.trim()) {
      setError('Digite uma descrição antes de pedir sugestão da IA.');
      return;
    }

    setSuggestingCategory(true);
    try {
      const res = await AiService.suggestCategory(activeWallet.id, {
        description: txForm.description.trim(),
        type: txForm.type,
      });
      if (res.data?.categoryId) {
        setTxForm((prev) => ({
          ...prev,
          categoryId: String(res.data.categoryId),
        }));
        setSuccess(
          `Categoria sugerida pela IA: ${res.data.categoryName}. ${res.data.reason || ''}`
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível sugerir a categoria com IA.'
      );
    } finally {
      setSuggestingCategory(false);
    }
  };

  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!activeWallet) return;

    setError('');
    setSuccess('');

    const parsedAmount = Number(txForm.amount);
    if (!parsedAmount || parsedAmount < 0.01) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!txForm.date) {
      setError('Informe a data da transação.');
      return;
    }

    setSavingTx(true);
    try {
      const payload = {
        type: txForm.type,
        amount: parsedAmount,
        description: txForm.description.trim() || null,
        date: txForm.date,
        categoryId: txForm.categoryId ? Number(txForm.categoryId) : null,
      };

      if (editingTxId) {
        await TransactionService.update(activeWallet.id, editingTxId, payload);
        setSuccess('Transação atualizada com sucesso.');
      } else {
        await TransactionService.create(activeWallet.id, payload);
        setSuccess('Transação criada com sucesso.');
      }

      resetTxForm();
      await loadTransactions(pageInfo.page);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível salvar a transação.'
      );
    } finally {
      setSavingTx(false);
    }
  };

  const handleDeleteTx = async (id) => {
    if (!activeWallet) return;
    setError('');
    setSuccess('');
    try {
      await TransactionService.delete(activeWallet.id, id);
      setSuccess('Transação excluída com sucesso.');
      await loadTransactions(pageInfo.page);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível excluir a transação.'
      );
    }
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      type: 'EXPENSE',
      color: '#171717',
    });
  };

  const handleEditCategory = (cat) => {
    setError('');
    setSuccess('');
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      type: cat.type,
      color: cat.color || '#171717',
    });
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = categoryForm.name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 80) {
      setError('O nome da categoria deve ter entre 3 e 80 caracteres.');
      return;
    }

    setSavingCategory(true);
    try {
      const payload = {
        name: trimmedName,
        type: categoryForm.type,
        color: categoryForm.color,
      };

      if (editingCategoryId) {
        await CategoryService.update(editingCategoryId, payload);
        setSuccess('Categoria atualizada com sucesso.');
      } else {
        await CategoryService.create(payload);
        setSuccess('Categoria criada com sucesso.');
      }

      resetCategoryForm();
      await loadCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível salvar a categoria.'
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setError('');
    setSuccess('');
    try {
      await CategoryService.delete(id);
      setSuccess('Categoria excluída com sucesso.');
      await loadCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível excluir a categoria (ela pode estar em uso).'
      );
    }
  };

  const filteredCategoriesForTxForm = categories.filter(
    (c) => c.type === txForm.type
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          {activeWallet && (
            <p className="text-muted-foreground mt-1 text-sm">
              Carteira: {activeWallet.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
            className="cursor-pointer"
          >
            Lançamentos
          </Button>
          <Button
            type="button"
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="cursor-pointer"
          >
            Categorias
          </Button>
          {activeTab === 'transactions' && canEdit && (
            <Button
              type="button"
              onClick={() => {
                if (showTxForm && !editingTxId) {
                  resetTxForm();
                } else {
                  setEditingTxId(null);
                  setTxForm({
                    type: 'EXPENSE',
                    amount: '',
                    description: '',
                    date: getTodayIso(),
                    categoryId: '',
                  });
                  setShowTxForm(true);
                }
              }}
              className="cursor-pointer"
            >
              Nova transação
            </Button>
          )}
        </div>
      </header>

      <AlertMessage message={error} variant="error" />
      <AlertMessage message={success} variant="success" />

      {activeTab === 'transactions' ? (
        <>
          {showTxForm && canEdit && (
            <section className="border-border bg-card text-card-foreground rounded-none border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {editingTxId ? 'Editar transação' : 'Nova transação'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={resetTxForm}
                  aria-label="Fechar formulário"
                >
                  <X />
                </Button>
              </div>

              <form
                onSubmit={handleSubmitTx}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tx-type" className="text-muted-foreground">
                    Tipo
                  </Label>
                  <select
                    id="tx-type"
                    value={txForm.type}
                    onChange={(e) =>
                      setTxForm({
                        ...txForm,
                        type: e.target.value,
                        categoryId: '',
                      })
                    }
                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-none border px-2.5 text-sm outline-none focus-visible:ring-3"
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tx-amount" className="text-muted-foreground">
                    Valor (R$)
                  </Label>
                  <Input
                    id="tx-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tx-date" className="text-muted-foreground">
                    Data
                  </Label>
                  <Input
                    id="tx-date"
                    type="date"
                    value={txForm.date}
                    onChange={(e) =>
                      setTxForm({ ...txForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="tx-category"
                    className="text-muted-foreground"
                  >
                    Categoria
                  </Label>
                  <select
                    id="tx-category"
                    value={txForm.categoryId}
                    onChange={(e) =>
                      setTxForm({ ...txForm, categoryId: e.target.value })
                    }
                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-none border px-2.5 text-sm outline-none focus-visible:ring-3"
                  >
                    <option value="">Sem categoria</option>
                    {filteredCategoriesForTxForm.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="tx-description"
                    className="text-muted-foreground"
                  >
                    Descrição
                  </Label>
                  <Input
                    id="tx-description"
                    type="text"
                    value={txForm.description}
                    onChange={(e) =>
                      setTxForm({ ...txForm, description: e.target.value })
                    }
                    placeholder="Ex.: Supermercado"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 md:col-span-2 lg:col-span-5">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={suggestingCategory || !txForm.description.trim()}
                    onClick={handleSuggestCategory}
                    className="cursor-pointer"
                  >
                    <Sparkles data-icon="inline-start" />
                    {suggestingCategory
                      ? 'SUGERINDO...'
                      : 'SUGERIR CATEGORIA (IA)'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetTxForm}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingTx}
                    className="cursor-pointer"
                  >
                    {savingTx
                      ? 'Salvando...'
                      : editingTxId
                        ? 'Atualizar'
                        : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </section>
          )}

          <section className="border-border bg-card text-card-foreground rounded-none border p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-type" className="text-muted-foreground">
                  Tipo
                </Label>
                <select
                  id="filter-type"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
                >
                  <option value="">Todos</option>
                  <option value="INCOME">Receitas</option>
                  <option value="EXPENSE">Despesas</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-category"
                  className="text-muted-foreground"
                >
                  Categoria
                </Label>
                <select
                  id="filter-category"
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryId: e.target.value })
                  }
                  className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-start" className="text-muted-foreground">
                  Data inicial
                </Label>
                <Input
                  id="filter-start"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-end" className="text-muted-foreground">
                  Data final
                </Label>
                <Input
                  id="filter-end"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      type: '',
                      categoryId: '',
                      startDate: '',
                      endDate: '',
                    })
                  }
                  className="w-full cursor-pointer"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </section>

          <section className="border-border bg-card text-card-foreground rounded-none border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Lançamentos ({pageInfo.totalElements})
              </h2>
              {!canEdit && (
                <span className="text-muted-foreground text-xs">
                  Somente leitura
                </span>
              )}
            </div>

            {loading || loadingWallets ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-border bg-secondary text-muted-foreground border-b text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Responsável</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3 text-right">Valor</th>
                        {canEdit && (
                          <th className="px-4 py-3 text-right">Ações</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {transactions.map((t) => {
                        const isIncome = t.type === 'INCOME';
                        return (
                          <tr key={t.id} className="hover:bg-secondary/60">
                            <td className="flex items-center gap-2.5 px-4 py-3 font-medium">
                              {isIncome ? (
                                <PlusCircle className="text-foreground size-4 shrink-0" />
                              ) : (
                                <MinusCircle className="text-muted-foreground size-4 shrink-0" />
                              )}
                              {t.description || t.categoryName || 'Lançamento'}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {t.categoryName || 'Sem categoria'}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {t.createdByName || '—'}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {t.date
                                ? t.date.split('-').reverse().join('/')
                                : '—'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold ${
                                isIncome
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                            </td>
                            {canEdit && (
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleOpenEditTx(t)}
                                    aria-label="Editar transação"
                                  >
                                    <Pencil />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleDeleteTx(t.id)}
                                    aria-label="Excluir transação"
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pageInfo.totalPages > 1 && (
                  <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-muted-foreground text-xs">
                      Página {pageInfo.page + 1} de {pageInfo.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pageInfo.page <= 0}
                        onClick={() => loadTransactions(pageInfo.page - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                        onClick={() => loadTransactions(pageInfo.page + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground py-10 text-center text-sm">
                Nenhuma transação encontrada para os filtros selecionados.
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="border-border bg-card text-card-foreground rounded-none border p-6">
            <h2 className="mb-4 text-lg font-medium">
              {editingCategoryId ? 'Editar categoria' : 'Nova categoria'}
            </h2>

            <form
              onSubmit={handleSubmitCategory}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-name" className="text-muted-foreground">
                  Nome
                </Label>
                <Input
                  id="cat-name"
                  type="text"
                  minLength={3}
                  maxLength={80}
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="Ex.: Alimentação"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-type" className="text-muted-foreground">
                  Tipo
                </Label>
                <select
                  id="cat-type"
                  value={categoryForm.type}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, type: e.target.value })
                  }
                  className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-color" className="text-muted-foreground">
                  Tom
                </Label>
                <select
                  id="cat-color"
                  value={categoryForm.color}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, color: e.target.value })
                  }
                  className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
                >
                  {MONOCHROME_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                {editingCategoryId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetCategoryForm}
                    className="flex-1 cursor-pointer"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={savingCategory}
                  className="flex-1 cursor-pointer"
                >
                  {savingCategory
                    ? 'Salvando...'
                    : editingCategoryId
                      ? 'Atualizar'
                      : 'Criar categoria'}
                </Button>
              </div>
            </form>
          </section>

          <section className="border-border bg-card text-card-foreground rounded-none border p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-medium">
              Categorias cadastradas ({categories.length})
            </h2>

            {categories.length > 0 ? (
              <div className="divide-border divide-y">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className="border-border size-3 shrink-0 border"
                        style={{ backgroundColor: cat.color || '#171717' }}
                      />
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {cat.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {cat.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditCategory(cat)}
                        aria-label="Editar categoria"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteCategory(cat.id)}
                        aria-label="Excluir categoria"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhuma categoria cadastrada ainda.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
