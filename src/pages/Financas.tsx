import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, PiggyBank, Percent, Plus, Check, Trash2, ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { loadData, saveData, formatCurrency, MONTHS, EXPENSE_CATEGORIES, EXPENSE_COLORS, type Transaction, type RecurringExpense } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ViewMode = 'main' | 'expenses';

export default function Financas() {
  const [data, setData] = useState(loadData);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({ type: 'expense', category: 'Comida' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Aluguel', dueDay: '10' });
  const [savingsAmount, setSavingsAmount] = useState('');
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [data.transactions, month, year]);

  const recurringExpenses = data.recurringExpenses || [];
  const paidRecurring = recurringExpenses.filter(e => e.paidMonths?.includes(monthKey));
  const unpaidRecurring = recurringExpenses.filter(e => !e.paidMonths?.includes(monthKey));
  const totalRecurringPaid = paidRecurring.reduce((s, e) => s + e.amount, 0);

  const monthlySavings = data.monthlySavings || [];
  const currentMonthSaving = monthlySavings.find(s => s.month === monthKey);
  const totalSavings = monthlySavings.reduce((s, m) => s + m.amount, 0);

  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) + totalRecurringPaid;
  const balance = income - expenses + data.initialReserve;
  const savingsPercent = income > 0 ? ((income - expenses) / income * 100) : 0;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    paidRecurring.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: EXPENSE_COLORS[EXPENSE_CATEGORIES.indexOf(name)] || EXPENSE_COLORS[6],
    }));
  }, [monthTransactions, paidRecurring]);

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

  const addRecurringExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    const expense: RecurringExpense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      dueDay: Number(newExpense.dueDay),
      paidMonths: [],
    };
    const updated = { ...data, recurringExpenses: [...recurringExpenses, expense] };
    setData(updated);
    saveData(updated);
    setExpenseDialogOpen(false);
    setNewExpense({ name: '', amount: '', category: 'Aluguel', dueDay: '10' });
  };

  const toggleRecurringPaid = (id: string) => {
    const updated = {
      ...data,
      recurringExpenses: recurringExpenses.map(e => {
        if (e.id !== id) return e;
        const paid = e.paidMonths?.includes(monthKey);
        return {
          ...e,
          paidMonths: paid
            ? (e.paidMonths || []).filter(m => m !== monthKey)
            : [...(e.paidMonths || []), monthKey],
        };
      }),
    };
    setData(updated);
    saveData(updated);
  };

  const deleteRecurringExpense = (id: string) => {
    const updated = { ...data, recurringExpenses: recurringExpenses.filter(e => e.id !== id) };
    setData(updated);
    saveData(updated);
  };

  const addMonthlySaving = () => {
    if (!savingsAmount) return;
    const amount = Number(savingsAmount);
    const existing = monthlySavings.find(s => s.month === monthKey);
    let updated;
    if (existing) {
      updated = {
        ...data,
        monthlySavings: monthlySavings.map(s => s.month === monthKey ? { ...s, amount: s.amount + amount } : s),
      };
    } else {
      updated = {
        ...data,
        monthlySavings: [...monthlySavings, { month: monthKey, amount }],
      };
    }
    setData(updated);
    saveData(updated);
    setSavingsDialogOpen(false);
    setSavingsAmount('');
  };

  // EXPENSES VIEW (like Rotina)
  if (viewMode === 'expenses') {
    return (
      <div className="px-4 pt-6 pb-24 safe-bottom max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('main')} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black tracking-tight">GASTOS FIXOS</h1>
          </div>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
                <Plus size={16} /> Novo
              </button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border max-w-sm">
              <DialogHeader>
                <DialogTitle>Novo Gasto Fixo</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input
                  placeholder="Nome (ex: Aluguel, Internet)"
                  className="bg-secondary border-border"
                  value={newExpense.name}
                  onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Valor"
                  className="bg-secondary border-border"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <select
                  className="w-full py-2 px-3 rounded-lg bg-secondary text-foreground border border-border text-sm"
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input
                  type="number"
                  placeholder="Dia de vencimento (1-31)"
                  className="bg-secondary border-border"
                  min={1}
                  max={31}
                  value={newExpense.dueDay}
                  onChange={e => setNewExpense({ ...newExpense, dueDay: e.target.value })}
                />
                <Button onClick={addRecurringExpense} className="w-full bg-primary text-primary-foreground font-semibold">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="card-gradient-expense rounded-2xl p-5 mb-5 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2">Total Mensal</p>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-3xl font-black text-destructive">
              {formatCurrency(recurringExpenses.reduce((s, e) => s + e.amount, 0), data.currency)}
            </span>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-primary">{paidRecurring.length} pagos</span>
            <span className="text-destructive">{unpaidRecurring.length} pendentes</span>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-3 mb-6">
          {recurringExpenses.map(expense => {
            const paid = expense.paidMonths?.includes(monthKey);
            const color = EXPENSE_COLORS[EXPENSE_CATEGORIES.indexOf(expense.category)] || EXPENSE_COLORS[6];
            
            return (
              <div
                key={expense.id}
                className="bg-secondary rounded-2xl p-4 animate-fade-in relative overflow-hidden"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => deleteRecurringExpense(expense.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + '22' }}
                  >
                    <TrendingDown size={18} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-bold text-sm mb-0.5">{expense.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>Vence dia {expense.dueDay}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color }}>
                      {formatCurrency(expense.amount, data.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Status: <span className={paid ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                      {paid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>

                  {paid ? (
                    <button
                      onClick={() => toggleRecurringPaid(expense.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-xs font-semibold text-primary"
                    >
                      <Check size={14} />
                      Pago
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleRecurringPaid(expense.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Marcar Pago
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {recurringExpenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum gasto fixo cadastrado</p>
              <p className="text-xs mt-1">Clique em "Novo" para adicionar</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="px-4 pt-6 pb-24 safe-bottom max-w-md mx-auto">
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
              {newTx.type === 'expense' && (
                <select
                  className="w-full py-2 px-3 rounded-lg bg-secondary text-foreground border border-border text-sm"
                  value={newTx.category}
                  onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
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
        <button 
          onClick={() => setViewMode('expenses')}
          className="card-gradient-expense rounded-2xl p-4 animate-fade-in text-left hover:ring-2 hover:ring-destructive/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-destructive" />
            </div>
            <Plus size={14} className="text-destructive" />
          </div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(expenses, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Saídas</p>
          {unpaidRecurring.length > 0 && (
            <p className="text-[10px] text-destructive mt-1">{unpaidRecurring.length} pendente(s)</p>
          )}
        </button>
        <div className="card-gradient-balance rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-xl font-bold">{formatCurrency(balance, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Saldo Total</p>
        </div>
        <button 
          onClick={() => setSavingsDialogOpen(true)}
          className="card-gradient-reserve rounded-2xl p-4 animate-fade-in text-left hover:ring-2 hover:ring-primary/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <PiggyBank size={16} className="text-primary" />
            </div>
            <Plus size={14} className="text-primary" />
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalSavings, data.currency)}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Poupança</p>
          {currentMonthSaving && (
            <p className="text-[10px] text-primary mt-1">+{formatCurrency(currentMonthSaving.amount, data.currency)} este mês</p>
          )}
        </button>
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

      {/* Savings Dialog */}
      <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
        <DialogContent className="bg-popover border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Poupança</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Quanto você conseguiu economizar em {MONTHS[month]}?
            </p>
            <Input
              type="number"
              placeholder="Valor economizado"
              className="bg-secondary border-border"
              value={savingsAmount}
              onChange={e => setSavingsAmount(e.target.value)}
            />
            {currentMonthSaving && (
              <p className="text-xs text-muted-foreground">
                Já economizado este mês: {formatCurrency(currentMonthSaving.amount, data.currency)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Total acumulado: {formatCurrency(totalSavings, data.currency)}
            </p>
            <Button onClick={addMonthlySaving} className="w-full bg-primary text-primary-foreground font-semibold">
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
