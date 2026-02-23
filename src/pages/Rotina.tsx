import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { loadData, saveData, CATEGORY_CONFIG } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Rotina() {
  const [data, setData] = useState(loadData);
  const today = new Date().toISOString().slice(0, 10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'estudos' as keyof typeof CATEGORY_CONFIG });

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

  const addHabit = () => {
    if (!newHabit.name) return;
    const cat = CATEGORY_CONFIG[newHabit.category];
    const habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      icon: cat.icon,
      category: newHabit.category,
      completedDates: [],
    };
    const updated = { ...data, habits: [...data.habits, habit] };
    setData(updated);
    saveData(updated);
    setDialogOpen(false);
    setNewHabit({ name: '', category: 'estudos' });
  };

  const completedToday = data.habits.filter(h => h.completedDates.includes(today)).length;
  const total = data.habits.length;
  const progress = total > 0 ? (completedToday / total) * 100 : 0;

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">ROTINA</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
              <Plus size={16} /> Novo
            </button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border max-w-sm">
            <DialogHeader><DialogTitle>Novo Hábito</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Nome do hábito"
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
              <Button onClick={addHabit} className="w-full bg-primary text-primary-foreground font-semibold">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Progress */}
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

      {/* Habits List */}
      <div className="space-y-3">
        {data.habits.map(habit => {
          const done = habit.completedDates.includes(today);
          const catConfig = CATEGORY_CONFIG[habit.category as keyof typeof CATEGORY_CONFIG];
          const linkedGoal = data.goals.find(g => g.linkedHabitIds?.includes(habit.id));

          return (
            <div
              key={habit.id}
              className={`flex items-center gap-4 bg-secondary rounded-2xl p-4 transition-all animate-fade-in ${done ? 'opacity-70' : ''}`}
            >
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  done
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-muted-foreground/30'
                }`}
              >
                {done && <Check size={18} strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${done ? 'line-through' : ''}`}>{habit.icon} {habit.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: catConfig?.color + '22', color: catConfig?.color }}>
                    {catConfig?.label}
                  </span>
                  {linkedGoal && (
                    <span className="text-[10px] text-muted-foreground">→ {linkedGoal.title}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {habit.completedDates.length}×
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
