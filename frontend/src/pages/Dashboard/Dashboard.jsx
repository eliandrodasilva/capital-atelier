import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import DashboardService from '@/services/DashboardService';
import TransactionService from '@/services/TransactionService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AlertMessage from '@/components/ui/AlertMessage';

const MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeWallet, loadingWallets, walletError, canEdit } =
    useOutletContext();

  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loadingWallets || !activeWallet) return;

    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const [summaryRes, txRes] = await Promise.all([
          DashboardService.getSummary(activeWallet.id),
          TransactionService.list(activeWallet.id, {
            page: 0,
            size: 5,
            sort: 'date,desc',
          }),
        ]);

        if (cancelled) return;
        setError('');

        if (summaryRes.data) {
          const { balance, totalIncome, totalExpense, byMonth, byCategory } =
            summaryRes.data;

          setMetrics({
            balance: balance || 0,
            income: totalIncome || 0,
            expenses: totalExpense || 0,
          });

          if (byMonth && byMonth.length > 0) {
            setChartData(
              byMonth.map((m) => {
                let label;
                if (typeof m.month === 'string' && m.month.includes('-')) {
                  const [yearStr, monthStr] = m.month.split('-');
                  const monthIdx = Number(monthStr) - 1;
                  label = `${MONTH_NAMES[monthIdx] || monthStr}/${yearStr.slice(-2)}`;
                } else {
                  label = `${MONTH_NAMES[(Number(m.month) || 1) - 1]}/${String(m.year ?? '').slice(-2)}`;
                }

                return {
                  name: label,
                  Income: Number(m.income ?? m.totalIncome ?? 0),
                  Expenses: Number(m.expense ?? m.totalExpense ?? 0),
                };
              })
            );
          } else {
            setChartData([]);
          }

          setCategoryData(byCategory || []);
        }

        if (txRes.data && txRes.data.content) {
          setTransactions(
            txRes.data.content.map((t) => ({
              id: t.id,
              description: t.description || t.categoryName || 'Lançamento',
              categoryName: t.categoryName,
              value: t.amount || 0,
              type: t.type === 'INCOME' ? 'income' : 'expense',
              date: t.date ? t.date.split('-').reverse().join('/') : 'Sem data',
            }))
          );
        } else {
          setTransactions([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Erro ao carregar dados do dashboard.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [activeWallet, loadingWallets]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  if (loadingWallets || (Boolean(activeWallet) && loading)) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="text-muted-foreground size-10 animate-spin" />
        <p className="text-muted-foreground text-sm tracking-wide">
          Carregando dados financeiros...
        </p>
      </div>
    );
  }

  const totalByCategory = categoryData.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {activeWallet && (
            <p className="text-muted-foreground mt-1 text-sm">
              Carteira: {activeWallet.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/wallets')}
            className="cursor-pointer"
          >
            Carteiras
          </Button>
          {canEdit && (
            <Button
              type="button"
              onClick={() => navigate('/transactions')}
              className="cursor-pointer"
            >
              Nova transação
            </Button>
          )}
        </div>
      </header>

      <AlertMessage message={walletError || error} variant="error" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <span className="text-muted-foreground mb-3 block text-sm font-medium">
            Saldo atual
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.balance)}
          </h2>
        </div>

        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <span className="text-muted-foreground mb-3 block text-sm font-medium">
            Total de receitas
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.income)}
          </h2>
        </div>

        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <span className="text-muted-foreground mb-3 block text-sm font-medium">
            Total de despesas
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.expenses)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-border bg-card text-card-foreground rounded-none border p-6 lg:col-span-2">
          <h3 className="mb-6 text-lg font-medium">Fluxo de caixa mensal</h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0px',
                      color: 'var(--foreground)',
                    }}
                    labelStyle={{ color: 'var(--muted-foreground)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="square" />
                  <Area
                    type="monotone"
                    dataKey="Income"
                    name="Receitas"
                    stroke="var(--chart-1)"
                    fillOpacity={0.12}
                    fill="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="Expenses"
                    name="Despesas"
                    stroke="var(--chart-3)"
                    strokeDasharray="4 4"
                    fillOpacity={0.08}
                    fill="var(--chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-sm">
                <p>Nenhuma movimentação mensal registrada ainda.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-border bg-card text-card-foreground rounded-none border p-6">
          <h3 className="mb-6 text-lg font-medium">Por categoria</h3>
          {categoryData.length > 0 ? (
            <div className="flex flex-col gap-4">
              {categoryData.map((item) => {
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
                        {item.categoryName || 'Sem categoria'}
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
            <div className="text-muted-foreground flex h-[260px] items-center justify-center text-center text-sm">
              <p>Nenhuma categoria movimentada ainda.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-border bg-card text-card-foreground rounded-none border p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Lançamentos recentes</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/transactions')}
            className="cursor-pointer"
          >
            Ver todos
          </Button>
        </div>

        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="border-border bg-secondary text-muted-foreground border-b text-xs uppercase">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/60">
                    <td className="flex items-center gap-3 px-6 py-4 font-medium">
                      {t.type === 'income' ? (
                        <PlusCircle className="text-foreground size-5 shrink-0" />
                      ) : (
                        <MinusCircle className="text-muted-foreground size-5 shrink-0" />
                      )}
                      {t.description}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {t.categoryName || 'Sem categoria'}
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {t.date}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        t.type === 'income'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted-foreground py-8 text-center text-sm">
              <p>Nenhum lançamento registrado nesta carteira.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
