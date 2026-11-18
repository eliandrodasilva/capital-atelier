import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
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
import api from '@/config/axiosConfig';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        let walletsRes = await api.get('/api/wallets');
        let wallets = walletsRes.data || [];

        if (wallets.length === 0) {
          const newWalletRes = await api.post('/api/wallets', {
            name: 'Minha Carteira',
            description: 'Carteira principal de controle financeiro',
          });
          if (newWalletRes.data) {
            wallets = [newWalletRes.data];
          }
        }

        const activeWallet = wallets[0];

        if (activeWallet) {
          const summaryRes = await api.get(
            `/api/wallets/${activeWallet.id}/summary`
          );
          const summary = summaryRes.data;

          if (summary) {
            setMetrics({
              balance: Number(summary.balance) || 0,
              income: Number(summary.totalIncome) || 0,
              expenses: Number(summary.totalExpense) || 0,
            });

            if (summary.byMonth && summary.byMonth.length > 0) {
              setChartData(
                summary.byMonth.map((m) => ({
                  name: m.month,
                  Income: Number(m.income) || 0,
                  Expenses: Number(m.expense) || 0,
                }))
              );
            } else {
              setChartData([]);
            }
          }

          const transRes = await api.get(
            `/api/wallets/${activeWallet.id}/transactions?page=0&size=5&sort=date,desc`
          );
          const transContent = transRes.data?.content || [];

          setTransactions(
            transContent.map((t) => ({
              id: t.id,
              description: t.description || 'Sem descrição',
              value: Number(t.amount) || 0,
              type: t.type ? t.type.toLowerCase() : 'expense',
              date: t.date,
            }))
          );
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="text-muted-foreground size-10 animate-spin" />
        <p className="text-muted-foreground text-sm tracking-wide">
          Carregando dados financeiros...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Saldo Atual
            </span>
            <div className="border-border bg-secondary text-foreground rounded-none border p-2">
              <DollarSign className="size-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.balance)}
          </h2>
          <p className="text-muted-foreground mt-2 text-xs">
            Disponível em conta e carteira compartilhada
          </p>
        </div>

        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Total de Receitas
            </span>
            <div className="border-border bg-secondary text-foreground rounded-none border p-2">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.income)}
          </h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
            <ArrowUpRight className="size-4" /> Período atual de 30 dias
          </p>
        </div>

        <div className="border-border bg-card text-card-foreground relative overflow-hidden rounded-none border p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Total de Despesas
            </span>
            <div className="border-border bg-secondary text-foreground rounded-none border p-2">
              <TrendingDown className="size-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {formatCurrency(metrics.expenses)}
          </h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
            <ArrowDownLeft className="size-4" /> Período atual de 30 dias
          </p>
        </div>
      </div>

      <div className="border-border bg-card text-card-foreground rounded-none border p-6">
        <h3 className="mb-6 text-lg font-medium">Fluxo de Caixa (Mensal)</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Lançamentos Recentes</h3>
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
