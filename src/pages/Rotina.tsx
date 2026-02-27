import { useState } from "react";
import { Plus, Trash2, Flame, Check, RotateCcw } from "lucide-react";
import { loadData, saveData, CATEGORY_CONFIG, type Habit } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Rotina() {
  const [data, setData] = useState(loadData);
  const today = new Date().toISOString().slice(0, 10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'estudos' as keyof typeof CATEGORY_CONFIG,
    durationMonths: 0,
    durationDays: 30,
    weekdays: [0, 1, 2, 3, 4, 5, 6] as number[],
    notificationTime: '08:00',
  });

  const toggleHabit = (id: string) => {
    const updated = {
      ...data,
      habits: data.habits.map(h => {
        if (h.id !== id) return h;
        const done = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter(d => d !== today)
            : [...h.completedDates, today],
        };
      }),
    };
    setData(updated);
    saveData(updated);
  };

  const deleteHabit = (id: string) => {
    const updated = { ...data, habits: data.habits.filter(h => h.id !== id) };
    setData(updated);
    saveData(updated);
  };

  const resetHabit = (id: string) => {
    const updated = {
      ...data,
      habits: data.habits.map(h => h.id === id ? { ...h, completedDates: [], startDate: today } : h),
    };
    setData(updated);
    saveData(updated);
  };

  const addHabit = () => {
    if (!newHabit.name) return;
    const cat = CATEGORY_CONFIG[newHabit.category];
    const startDate = today;
    const totalDays = (newHabit.durationMonths * 30) + newHabit.durationDays;
    const targetDate = totalDays > 0
      ? new Date(new Date(startDate).getTime() + totalDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : undefined;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      icon: cat.icon,
      category: newHabit.category,
      completedDates: [],
      startDate,
      durationMonths: newHabit.durationMonths || undefined,
      durationDays: newHabit.durationDays || undefined,
      targetDate,
      weekdays: newHabit.weekdays,
      notificationTime: newHabit.notificationTime,
    };
    const updated = { ...data, habits: [...data.habits, habit] };
    setData(updated);
    saveData(updated);
    setDialogOpen(false);
    setNewHabit({ name: '', category: 'estudos', durationMonths: 0, durationDays: 30, weekdays: [0, 1, 2, 3, 4, 5, 6], notificationTime: '08:00' });
  };

  const getStreak = (habit: Habit) => {
    const dates = [...habit.completedDates].sort().reverse();
    if (dates.length === 0) return 0;
    let streak = 0;
    const currentDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      if (dates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getFrequencyLabel = (habit: Habit) => {
    if (!habit.weekdays || habit.weekdays.length === 7) return 'Todo dia';
    if (habit.weekdays.length === 0) return 'Sem dias';
    return `${habit.weekdays.length}x por semana`;
  };

  const getImpact = (habit: Habit) => {
    const totalHabitsInCategory = data.habits.filter(h => h.category === habit.category).length;
    if (totalHabitsInCategory === 0) return 0;
    return (1 / totalHabitsInCategory) * 0.5;
  };

  const completedToday = data.habits.filter(h => h.completedDates.includes(today)).length;
  const total = data.habits.length;
  const progress = total > 0 ? (completedToday / total) * 100 : 0;

  return (
    <div className="px-4 pt-6 pb-24 safe-bottom max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">ROTINA</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
              <Plus size={16} /> Novo
            </button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border max-w-sm max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Atividade</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Nome da atividade"
                className="bg-secondary border-border"
                value={newHabit.name}
                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              />
              <select
                className="w-full py-2 px-3 rounded-lg bg-secondary text-foreground border border-border text-sm"
                value={newHabit.category}
                onChange={e => setNewHabit({ ...newHabit, category: e.target.value as keyof typeof CATEGORY_CONFIG })}
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>

              <div className="rounded-lg bg-secondary px-3 py-3">
                <p className="text-xs font-semibold mb-2">Dias da semana</p>
                <div className="flex gap-1.5 justify-between">
                  {WEEKDAY_LABELS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const days = newHabit.weekdays.includes(i)
                          ? newHabit.weekdays.filter(d => d !== i)
                          : [...newHabit.weekdays, i];
                        setNewHabit({ ...newHabit, weekdays: days });
                      }}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-colors ${
                        newHabit.weekdays.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-secondary px-3 py-3">
                <p className="text-xs font-semibold mb-2">Horário da atividade</p>
                <Input
                  type="time"
                  className="bg-muted border-none"
                  value={newHabit.notificationTime}
                  onChange={e => setNewHabit({ ...newHabit, notificationTime: e.target.value })}
                />
              </div>

              <div className="rounded-lg bg-secondary px-3 py-3">
                <p className="text-xs font-semibold mb-2">Duração</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      className="bg-muted border-none text-center"
                      value={newHabit.durationMonths}
                      onChange={e => setNewHabit({ ...newHabit, durationMonths: Number(e.target.value) })}
                    />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">meses</p>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      className="bg-muted border-none text-center"
                      value={newHabit.durationDays}
                      onChange={e => setNewHabit({ ...newHabit, durationDays: Number(e.target.value) })}
                    />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">dias</p>
                  </div>
                </div>
              </div>

              <Button onClick={addHabit} className="w-full bg-primary text-primary-foreground font-semibold">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-gradient-savings rounded-2xl p-5 mb-5 animate-fade-in">
        <p className="text-sm text-muted-foreground mb-2">Progresso Diário</p>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-3xl font-black text-primary">{completedToday}/{total}</span>
          <span className="text-sm text-muted-foreground pb-1">concluídos</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {data.habits.map(habit => {
          const done = habit.completedDates.includes(today);
          const catConfig = CATEGORY_CONFIG[habit.category as keyof typeof CATEGORY_CONFIG];
          const streak = getStreak(habit);
          const frequency = getFrequencyLabel(habit);
          const impact = getImpact(habit);

          return (
            <div
              key={habit.id}
              className="bg-secondary rounded-2xl p-4 animate-fade-in relative overflow-hidden"
              style={{ borderLeft: `3px solid ${catConfig?.color}` }}
            >
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => resetHabit(habit.id)}
                  className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
                  title="Resetar progresso"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: catConfig?.color + '22' }}
                >
                  <span className="text-lg">{habit.icon}</span>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-bold text-sm mb-0.5">{habit.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{frequency}</span>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame size={12} /> {streak} dias
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Impacto</p>
                    <p className="text-xs font-semibold" style={{ color: catConfig?.color }}>
                      +{(impact * 100).toFixed(1)}% em {catConfig?.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex gap-1">
                  {WEEKDAY_LABELS.map((day, i) => {
                    const isActive = habit.weekdays?.includes(i);
                    return (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/50 text-muted-foreground/50'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {done ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20">
                    <Check size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-primary">+{(impact * 100).toFixed(1)}% no Atlas</span>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-muted-foreground/30 text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                    Concluir
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {data.habits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhuma atividade criada</p>
            <p className="text-xs mt-1">Clique em "Novo" para adicionar</p>
          </div>
        )}
      </div>
    </div>
  );
}
