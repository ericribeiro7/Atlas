import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { loadData, saveData, CATEGORY_CONFIG, type Goal } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Metas() {
  const [data, setData] = useState(loadData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: '', category: 'estudos' as Goal['category'], target: '', deadline: '' });

  const activeGoals = data.goals.filter(g => g.progress < g.target);
  const completedGoals = data.goals.filter(g => g.progress >= g.target);
  const overallProgress = data.goals.length > 0
    ? data.goals.reduce((s, g) => s + Math.min(100, (g.progress / g.target) * 100), 0) / data.goals.length
    : 0;

  const openCreate = () => {
    setEditingGoal(null);
    setForm({ title: '', category: 'estudos', target: '', deadline: '' });
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({ title: goal.title, category: goal.category, target: goal.target.toString(), deadline: goal.deadline });
    setDialogOpen(true);
  };

  const saveGoal = () => {
    if (!form.title || !form.target) return;
    let updated;
    if (editingGoal) {
      updated = {
        ...data,
        goals: data.goals.map(g => g.id === editingGoal.id
          ? { ...g, title: form.title, category: form.category, target: Number(form.target), deadline: form.deadline }
          : g
        ),
      };
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        title: form.title,
        category: form.category,
        progress: 0,
        target: Number(form.target),
        deadline: form.deadline,
        linkedHabitIds: [],
      };
      updated = { ...data, goals: [...data.goals, goal] };
    }
    setData(updated);
    saveData(updated);
    setDialogOpen(false);
  };

  const deleteGoal = (id: string) => {
    const updated = { ...data, goals: data.goals.filter(g => g.id !== id) };
    setData(updated);
    saveData(updated);
  };

  const updateProgress = (id: string, value: number) => {
    const updated = {
      ...data,
      goals: data.goals.map(g => g.id === id ? { ...g, progress: value } : g),
    };
    setData(updated);
    saveData(updated);
  };

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">METAS</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-secondary rounded-xl p-3 text-center animate-fade-in">
          <p className="text-2xl font-black text-primary">{activeGoals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Ativas</p>
        </div>
        <div className="flex-1 bg-secondary rounded-xl p-3 text-center animate-fade-in">
          <p className="text-2xl font-black text-accent">{completedGoals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Completas</p>
        </div>
        <div className="flex-1 bg-secondary rounded-xl p-3 text-center animate-fade-in">
          <p className="text-2xl font-black">{overallProgress.toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Progresso</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {data.goals.map(goal => {
          const catConfig = CATEGORY_CONFIG[goal.category];
          const pct = Math.min(100, (goal.progress / goal.target) * 100);
          const linkedHabits = data.habits.filter(h => goal.linkedHabitIds.includes(h.id));

          return (
            <div key={goal.id} className="bg-secondary rounded-2xl p-4 animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{goal.title}</h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ backgroundColor: catConfig.color + '22', color: catConfig.color }}
                  >
                    {catConfig.icon} {catConfig.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(goal)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: catConfig.color }} />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{goal.progress} / {goal.target} ({pct.toFixed(0)}%)</span>
                {goal.deadline && <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>}
              </div>

              {/* Progress update */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="h-8 bg-muted border-none text-xs w-20"
                  placeholder="Valor"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (val) updateProgress(goal.id, val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <span className="text-[10px] text-muted-foreground">Enter p/ atualizar</span>
              </div>

              {linkedHabits.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {linkedHabits.map(h => (
                    <span key={h.id} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {h.icon} {h.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-popover border-border max-w-sm">
          <DialogHeader><DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Título da meta"
              className="bg-secondary border-border"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="w-full py-2 px-3 rounded-lg bg-secondary text-foreground border border-border text-sm"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as Goal['category'] })}
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Meta (valor alvo)"
              className="bg-secondary border-border"
              value={form.target}
              onChange={e => setForm({ ...form, target: e.target.value })}
            />
            <Input
              type="date"
              className="bg-secondary border-border"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
            <Button onClick={saveGoal} className="w-full bg-primary text-primary-foreground font-semibold">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
