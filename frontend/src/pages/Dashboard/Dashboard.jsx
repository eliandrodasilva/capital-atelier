import React, { useState, useEffect } from 'react';
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
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
        <p className="text-sm tracking-wide text-zinc-400">
          Carregando dados financeiros...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Visão geral do seu sistema e estatísticas financeiras.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Saldo Atual
            </span>
            <div className="rounded-lg bg-zinc-800 p-2 text-zinc-300">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
            {formatCurrency(metrics.balance)}
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Disponível em conta e carteira compartilhada
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Total de Receitas
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-emerald-400">
            {formatCurrency(metrics.income)}
          </h2>
          <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500/80">
            <ArrowUpRight className="h-4 w-4" /> Período atual de 30 dias
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Total de Despesas
            </span>
            <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-red-400">
            {formatCurrency(metrics.expenses)}
          </h2>
          <p className="mt-2 flex items-center gap-1 text-xs text-red-500/80">
            <ArrowDownLeft className="h-4 w-4" /> Período atual de 30 dias
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h3 className="mb-6 text-lg font-medium text-zinc-200">
          Fluxo de Caixa (Mensal)
        </h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="Income"
                  name="Receitas"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  name="Despesas"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-sm text-zinc-500">
              <p>Nenhuma movimentação mensal registrada ainda.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-200">
            Lançamentos Recentes
          </h3>
        </div>

        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs text-zinc-500 uppercase">
                <tr>
                  <th scope="col" className="rounded-l-lg px-6 py-4">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Data
                  </th>
                  <th scope="col" className="rounded-r-lg px-6 py-4 text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-zinc-850 divide-y">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/20">
                    <td className="flex items-center gap-3 px-6 py-4 font-medium text-zinc-200">
                      {t.type === 'income' ? (
                        <PlusCircle className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                      ) : (
                        <MinusCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                      )}
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{t.date}</td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {t.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-sm text-zinc-500">
              <p>Nenhum lançamento registrado nesta carteira.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
