// Simple localStorage-based store

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  goalId?: string;
  completedDates: string[];
}

export interface Goal {
  id: string;
  title: string;
  category: 'estudos' | 'saude' | 'financas' | 'pessoal';
  progress: number;
  target: number;
  deadline: string;
  linkedHabitIds: string[];
}

export interface AppData {
  transactions: Transaction[];
  habits: Habit[];
  goals: Goal[];
  monthlyBudget: number;
  initialReserve: number;
  currency: string;
}

const STORAGE_KEY = 'lifeapp-data';

const defaultData: AppData = {
  transactions: [
    { id: '1', type: 'income', amount: 100000, category: 'Salário', description: 'Salário mensal', date: '2026-01-05' },
    { id: '2', type: 'expense', amount: 350, category: 'Comida', description: 'Supermercado', date: '2026-01-10' },
    { id: '3', type: 'expense', amount: 200, category: 'Lazer', description: 'Cinema', date: '2026-01-12' },
    { id: '4', type: 'expense', amount: 169.43, category: 'Saúde', description: 'Farmácia', date: '2026-01-15' },
    { id: '5', type: 'expense', amount: 100, category: 'Aluguel', description: 'Aluguel', date: '2026-01-01' },
  ],
  habits: [
    { id: '1', name: '45 min de Inglês', icon: '📚', category: 'estudos', goalId: 'g1', completedDates: ['2026-01-20', '2026-01-21'] },
    { id: '2', name: 'Exercício 30 min', icon: '🏃', category: 'saude', completedDates: ['2026-01-20'] },
    { id: '3', name: 'Leitura 20 páginas', icon: '📖', category: 'estudos', completedDates: [] },
    { id: '4', name: 'Meditação 10 min', icon: '🧘', category: 'pessoal', completedDates: ['2026-01-20', '2026-01-21', '2026-01-22'] },
  ],
  goals: [
    { id: 'g1', title: 'Aulas de Inglês', category: 'estudos', progress: 15, target: 60, deadline: '2026-06-30', linkedHabitIds: ['1'] },
    { id: 'g2', title: 'Perder 5kg', category: 'saude', progress: 2, target: 5, deadline: '2026-04-30', linkedHabitIds: [] },
    { id: 'g3', title: 'Reserva de Emergência', category: 'financas', progress: 38338, target: 50000, deadline: '2026-12-31', linkedHabitIds: [] },
    { id: 'g4', title: 'Ler 12 livros', category: 'estudos', progress: 3, target: 12, deadline: '2026-12-31', linkedHabitIds: [] },
  ],
  monthlyBudget: 5000,
  initialReserve: 38338,
  currency: 'R$',
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
