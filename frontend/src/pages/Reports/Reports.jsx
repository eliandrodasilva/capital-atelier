import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download,
  Printer,
  Loader2,
  PlusCircle,
  MinusCircle,
  Sparkles,
} from 'lucide-react';
import ReportService from '@/services/ReportService';
import CategoryService from '@/services/CategoryService';
import AiService from '@/services/AiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import AlertMessage from '@/components/ui/AlertMessage';

function formatIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: formatIsoDate(start), endDate: formatIsoDate(now) };
}

function getLastDaysRange(days) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return { startDate: formatIsoDate(start), endDate: formatIsoDate(now) };
}

const ReportsPage = () => {
  const { activeWallet, loadingWallets, realtimeVersion } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(() => ({
    type: '',
    categoryId: '',
    ...getCurrentMonthRange(),
  }));

  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    CategoryService.list()
      .then((res) => {
        if (!cancelled) setCategories(res.data || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadingWallets || !activeWallet) return;

    let cancelled = false;
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.categoryId) params.categoryId = Number(filters.categoryId);
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    ReportService.getStatement(activeWallet.id, params)
      .then((res) => {
        if (!cancelled) {
          setError('');
          setStatement(res.data || null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Não foi possível gerar o relatório.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWallet, loadingWallets, filters, realtimeVersion]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);

  const handleExportCsv = async () => {
    if (!activeWallet) return;
    setExporting(true);
    setError('');
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = Number(filters.categoryId);
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await ReportService.exportCsv(activeWallet.id, params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extrato-${activeWallet.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Não foi possível exportar o CSV.'
      );
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateInsights = async () => {
    if (!activeWallet) return;
    setLoadingAi(true);
    setError('');
    try {
      const res = await AiService.generateInsights(activeWallet.id, {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
      });
      setAiInsight(res.data || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Não foi possível gerar a análise com IA.'
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const applyPreset = (range) => {
    setFilters((prev) => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  };

  const totalByCategory = (statement?.byCategory || []).reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          {activeWallet && (
            <p className="text-muted-foreground mt-1 text-sm">
              Extrato consolidado — {activeWallet.name}
            </p>
          )}
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateInsights}
            disabled={loadingAi || !activeWallet}
            className="cursor-pointer"
          >
            <Sparkles data-icon="inline-start" />
            {loadingAi ? 'Analisando...' : 'Analisar com IA'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            disabled={exporting || !activeWallet}
            className="cursor-pointer"
          >
            <Download data-icon="inline-start" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            disabled={!statement}
            className="cursor-pointer"
          >
            <Printer data-icon="inline-start" />
            Imprimir / PDF
          </Button>
        </div>
      </header>

      <AlertMessage message={error} variant="error" />

      {aiInsight && (
        <section className="border-border bg-card text-card-foreground flex flex-col gap-4 rounded-none border p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0" />
              <h2 className="text-lg font-medium">Análise Financeira (IA)</h2>
            </div>
            {aiInsight.model && (
              <span className="border-border bg-secondary text-muted-foreground border px-2 py-0.5 text-[11px]">
                {aiInsight.model}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed">{aiInsight.summary}</p>

          {aiInsight.highlights && aiInsight.highlights.length > 0 && (
            <ul className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              {aiInsight.highlights.map((item, idx) => (
                <li key={idx} className="text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          )}

          {aiInsight.recommendation && (
            <div className="border-border bg-secondary border p-3 text-sm">
              <span className="font-medium">Recomendação: </span>
              <span className="text-muted-foreground">
                {aiInsight.recommendation}
              </span>
            </div>
          )}
        </section>
      )}

      <section className="no-print border-border bg-card text-card-foreground flex flex-col gap-4 rounded-none border p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-2 text-xs font-medium uppercase">
            Período rápido:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset(getCurrentMonthRange())}
          >
            Mês atual
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset(getLastDaysRange(30))}
          >
            Últimos 30 dias
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset(getLastDaysRange(90))}
          >
            Últimos 90 dias
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset({ startDate: '', endDate: '' })}
          >
            Todo o período
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rep-type" className="text-muted-foreground">
              Tipo
            </Label>
            <select
              id="rep-type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border-input bg-background text-foreground h-9 w-full rounded-none border px-2.5 text-sm outline-none"
            >
              <option value="">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rep-category" className="text-muted-foreground">
              Categoria
            </Label>
            <select
              id="rep-category"
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
            <Label htmlFor="rep-start" className="text-muted-foreground">
              Data Inicial
            </Label>
            <Input
              id="rep-start"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rep-end" className="text-muted-foreground">
              Data Final
            </Label>
            <Input
              id="rep-end"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {loading || loadingWallets ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : statement ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="border-border bg-card text-card-foreground rounded-none border p-6">
              <p className="text-muted-foreground text-xs uppercase">
                Saldo no Período
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrency(statement.balance)}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {statement.transactionCount} lançamento(s)
              </p>
            </div>

            <div className="border-border bg-card text-card-foreground rounded-none border p-6">
              <p className="text-muted-foreground text-xs uppercase">
                Total de Receitas
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrency(statement.totalIncome)}
              </h2>
            </div>

            <div className="border-border bg-card text-card-foreground rounded-none border p-6">
              <p className="text-muted-foreground text-xs uppercase">
                Total de Despesas
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrency(statement.totalExpense)}
              </h2>
            </div>
          </div>

          <section className="border-border bg-card text-card-foreground rounded-none border p-6">
            <h2 className="mb-4 text-lg font-medium">Resumo por Categoria</h2>
            {statement.byCategory && statement.byCategory.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {statement.byCategory.map((item) => {
                  const amount = Number(item.total || 0);
                  const pct =
                    totalByCategory > 0
                      ? Math.round((amount / totalByCategory) * 100)
                      : 0;
                  return (
                    <div
                      key={item.categoryId ?? item.categoryName}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">
                          {item.categoryName}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {formatCurrency(amount)} ({pct}%)
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma categoria movimentada no período selecionado.
              </p>
            )}
          </section>

          <section className="border-border bg-card text-card-foreground rounded-none border p-6">
            <h2 className="mb-4 text-lg font-medium">Extrato Detalhado</h2>
            {statement.transactions && statement.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-border bg-secondary text-muted-foreground border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Responsável</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {statement.transactions.map((t) => {
                      const isIncome = t.type === 'INCOME';
                      return (
                        <tr key={t.id}>
                          <td className="text-muted-foreground px-4 py-3">
                            {t.date
                              ? t.date.split('-').reverse().join('/')
                              : '—'}
                          </td>
                          <td className="flex items-center gap-2 px-4 py-3 font-medium">
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
                          <td
                            className={`px-4 py-3 text-right font-semibold ${
                              isIncome
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhuma transação encontrada para os filtros selecionados.
              </p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default ReportsPage;
