import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  MinusCircle 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import api from "@/config/axiosConfig";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expenses: 0 });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        let walletsRes = await api.get("/api/wallets");
        let wallets = walletsRes.data || [];

        if (wallets.length === 0) {
          const newWalletRes = await api.post("/api/wallets", {
            name: "Minha Carteira",
            description: "Carteira principal de controle financeiro"
          });
          if (newWalletRes.data) {
            wallets = [newWalletRes.data];
          }
        }

        const activeWallet = wallets[0];

        if (activeWallet) {
          const summaryRes = await api.get(`/api/wallets/${activeWallet.id}/summary`);
          const summary = summaryRes.data;

          if (summary) {
            setMetrics({
              balance: Number(summary.balance) || 0,
              income: Number(summary.totalIncome) || 0,
              expenses: Number(summary.totalExpense) || 0
            });

            if (summary.byMonth && summary.byMonth.length > 0) {
              setChartData(
                summary.byMonth.map((m) => ({
                  name: m.month,
                  Income: Number(m.income) || 0,
                  Expenses: Number(m.expense) || 0
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
              description: t.description || "Sem descrição",
              value: Number(t.amount) || 0,
              type: t.type ? t.type.toLowerCase() : "expense",
              date: t.date
            }))
          );
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
        <p className="text-zinc-400 text-sm tracking-wide">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Visão geral do seu sistema e estatísticas financeiras.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">Saldo Atual</span>
            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-zinc-50 tracking-tight">
            {formatCurrency(metrics.balance)}
          </h2>
          <p className="text-xs text-zinc-500 mt-2">
            Disponível em conta e carteira compartilhada
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">Total de Receitas</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-emerald-400 tracking-tight">
            {formatCurrency(metrics.income)}
          </h2>
          <p className="text-xs text-emerald-500/80 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> Período atual de 30 dias
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-zinc-400">Total de Despesas</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-red-400 tracking-tight">
            {formatCurrency(metrics.expenses)}
          </h2>
          <p className="text-xs text-red-500/80 mt-2 flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4" /> Período atual de 30 dias
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-medium text-zinc-200 mb-6">Fluxo de Caixa (Mensal)</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} 
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="Income" name="Receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" name="Despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center flex-col text-zinc-500 text-sm">
              <p>Nenhuma movimentação mensal registrada ainda.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-zinc-200">Lançamentos Recentes</h3>
        </div>

        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 rounded-l-lg">Descrição</th>
                  <th scope="col" className="px-6 py-4">Data</th>
                  <th scope="col" className="px-6 py-4 text-right rounded-r-lg">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3 font-medium text-zinc-200">
                      {t.type === "income" ? (
                        <PlusCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <MinusCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{t.date}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-sm">
              <p>Nenhum lançamento registrado nesta carteira.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
