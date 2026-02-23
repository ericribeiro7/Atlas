import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Shield, Percent, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { loadData, saveData, formatCurrency, MONTHS, EXPENSE_CATEGORIES, EXPENSE_COLORS, type Transaction } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Financas() {
  const [data, setData] = useState(loadData);
  const [month, setMonth] = useState(0); // January 2026
  const [year] = useState(2026);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({ type: 'expense', category: 'Comida' });

  const monthTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [data.transactions, month, year]);

  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses + data.initialReserve;
  const savingsPercent = income > 0 ? ((income - expenses) / income * 100) : 0;
  const budgetPercent = data.monthlyBudget > 0 ? (expenses / data.monthlyBudget * 100) : 0;
  const remaining = data.monthlyBudget - expenses;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const currentDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : daysInMonth;
  const daysLeft = daysInMonth - currentDay;
  const dailyAvg = daysLeft > 0 ? remaining / daysLeft : remaining;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: EXPENSE_COLORS[EXPENSE_CATEGORIES.indexOf(name)] || EXPENSE_COLORS[6],
    }));
  }, [monthTransactions]);

  const addTransaction = () => {
    if (!newTx.amount || !newTx.description) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      type: newTx.type || 'expense',
      amount: Number(newTx.amount),
      category: newTx.category || 'Outros',
      description: newTx.description || '',
      date: newTx.date || new Date().toISOString().slice(0, 10),
    };
    const updated = { ...data, transactions: [...data.transactions, tx] };
    setData(updated);
    saveData(updated);
    setDialogOpen(false);
    setNewTx({ type: 'expense', category: 'Comida' });
  };

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">FINANCEIRO</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
              <Plus size={16} /> Novo
            </button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setNewTx({ ...newTx, type: 'income' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${newTx.type === 'income' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                >Entrada</button>
                <button
                  onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${newTx.type === 'expense' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}
                >Saída</button>
              </div>
              <Input
                placeholder="Descrição"
                className="bg-secondary border-border"
                value={newTx.description || ''}
                onChange={e => setNewTx({ ...newTx, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor"
                className="bg-secondary border-border"
                value={newTx.amount || ''}
                onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
              />
              <select
                className="w-full py-2 px-3 rounded-lg bg-secondary text-foreground border border-border text-sm"
                value={newTx.category}
                onChange={e => setNewTx({ ...newTx, category: e.target.value })}
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input
                type="date"
                className="bg-secondary border-border"
                value={newTx.date || new Date().toISOString().slice(0, 10)}
                onChange={e => setNewTx({ ...newTx, date: e.target.value })}
              />
              <Button onClick={addTransaction} className="w-full bg-primary text-primary-foreground font-semibold">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3 mb-5">
        <button onClick={() => setMonth(m => Math.max(0, m - 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-sm tracking-widest uppercase">{MONTHS[month]} {year}</span>
        <button onClick={() => setMonth(m => Math.min(11, m + 1))} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-gradient-income rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-xl font-bold">{formatCurrency(income, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Entradas</p>
        </div>
        <div className="card-gradient-expense rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-destructive" />
            </div>
          </div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(expenses, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Saídas</p>
        </div>
        <div className="card-gradient-balance rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet size={16} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              +{formatCurrency(data.initialReserve, data.currency)}
            </span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(balance, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Saldo Total</p>
        </div>
        <div className="card-gradient-reserve rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Shield size={16} className="text-muted-foreground" />
            </div>
          </div>
          <p className="text-xl font-bold">{formatCurrency(data.initialReserve, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Reserva Inicial</p>
        </div>
      </div>

      {/* Savings Indicator */}
      <div className="card-gradient-savings rounded-2xl p-5 mb-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent size={16} className="text-primary" />
            </div>
            <p className={`text-3xl font-black ${savingsPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {savingsPercent >= 0 ? '+' : ''}{savingsPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mt-1">Economizou</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Status Meta</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              savingsPercent >= 50 ? 'border-primary text-primary' :
              savingsPercent >= 20 ? 'border-accent text-accent' :
              'border-destructive text-destructive'
            }`}>
              {savingsPercent >= 50 ? 'EXCELENTE' : savingsPercent >= 20 ? 'BOM' : 'ATENÇÃO'}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Budget */}
      <div className="bg-secondary rounded-2xl p-5 mb-5 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-sm tracking-wide uppercase">Orçamento Mensal</h3>
          <span className={`text-xs font-bold flex items-center gap-1 ${budgetPercent <= 80 ? 'text-primary' : 'text-destructive'}`}>
            ✓ {budgetPercent <= 80 ? 'OK' : 'ALERTA'}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all ${budgetPercent <= 80 ? 'bg-primary' : 'bg-destructive'}`}
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {formatCurrency(expenses, data.currency)} gastos de {formatCurrency(data.monthlyBudget, data.currency)}
          </span>
          <span className="font-bold text-primary">{budgetPercent.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Restante:</span>
          <span className="font-bold text-primary">{formatCurrency(remaining, data.currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Média diária:</span>
          <span className="font-semibold">{formatCurrency(dailyAvg, data.currency)}/dia</span>
        </div>
      </div>

      {/* Category Donut Chart */}
      {categoryData.length > 0 && (
        <div className="bg-secondary rounded-2xl p-5 mb-5 animate-fade-in">
          <h3 className="font-black text-sm tracking-wide uppercase text-center mb-4">Gastos por Categoria</h3>
          <div className="relative w-48 h-48 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total</span>
              <span className="text-lg font-black">{formatCurrency(expenses, data.currency)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-muted-foreground uppercase font-semibold">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
