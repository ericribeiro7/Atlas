// Simple localStorage-based store

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDay: number; // day of month (1-31)
  paidMonths: string[]; // ['2026-02', '2026-03'] format
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  goalId?: string;
  completedDates: string[];
  startDate?: string;
  durationMonths?: number;
  durationDays?: number;
  targetDate?: string;
  weekdays?: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  notificationTime?: string; // HH:mm format
}

export interface AppProfile {
  userName: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: 'estudos' | 'saude' | 'financas' | 'pessoal';
  progress: number;
  target: number;
  deadline: string;
  linkedHabitIds: string[];
  monthlyContribution?: number;
  isMain?: boolean;
  isNonFinancial?: boolean;
  isCompleted?: boolean;
}

export interface MonthlySaving {
  month: string; // '2026-02' format
  amount: number;
}

export interface AppData {
  transactions: Transaction[];
  habits: Habit[];
  goals: Goal[];
  recurringExpenses: RecurringExpense[];
  monthlySavings: MonthlySaving[];
  monthlyBudget: number;
  initialReserve: number;
  currency: string;
  userName: string;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'lifeapp-data';

const defaultData: AppData = {
  transactions: [],
  habits: [],
  goals: [],
  recurringExpenses: [],
  monthlySavings: [],
  monthlyBudget: 0,
  initialReserve: 0,
  currency: 'R$',
  userName: '',
  notificationsEnabled: true,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultData;
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function formatCurrency(value: number, currency: string = 'R$'): string {
  return `${currency} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const CATEGORY_CONFIG = {
  estudos: { label: 'Estudos', icon: '📚', color: 'hsl(220, 70%, 55%)' },
  saude: { label: 'Saúde', icon: '🏃', color: 'hsl(142, 60%, 45%)' },
  financas: { label: 'Finanças', icon: '💰', color: 'hsl(46, 80%, 50%)' },
  pessoal: { label: 'Pessoal', icon: '⭐', color: 'hsl(280, 60%, 55%)' },
} as const;

export const EXPENSE_CATEGORIES = ['Lazer', 'Aluguel', 'Saúde', 'Comida', 'Transporte', 'Educação', 'Outros'];
export const EXPENSE_COLORS = ['hsl(260,60%,55%)', 'hsl(340,70%,55%)', 'hsl(30,80%,55%)', 'hsl(0,70%,55%)', 'hsl(200,70%,55%)', 'hsl(160,60%,50%)', 'hsl(0,0%,50%)'];
