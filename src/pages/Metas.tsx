import { useState } from "react";
import { Plus, Pencil, Trash2, Target, TrendingUp, CheckCircle } from "lucide-react";
import { loadData, saveData, formatCurrency, CATEGORY_CONFIG, type Goal } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Metas() {
  const [data, setData] = useState(loadData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '',
    category: 'estudos' as Goal['category'], 
    target: '', 
    deadline: '',
    monthlyContribution: '',
    imageUrl: '',
    isMain: false,
    isNonFinancial: false,
    isCompleted: false,
  });

  const activeGoals = data.goals.filter(g => !g.isCompleted && g.progress < g.target);
  const completedGoals = data.goals.filter(g => g.isCompleted || g.progress >= g.target);
  const mainGoal = data.goals.find(g => g.isMain && !g.isCompleted);

  const openCreate = () => {
    setEditingGoal(null);
    setForm({ title: '', description: '', category: 'estudos', target: '', deadline: '', monthlyContribution: '', imageUrl: '', isMain: false, isNonFinancial: false, isCompleted: false });
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({ 
      title: goal.title, 
      description: goal.description || '',
      category: goal.category, 
      target: goal.target.toString(), 
      deadline: goal.deadline,
      monthlyContribution: goal.monthlyContribution?.toString() || '',
      imageUrl: goal.imageUrl || '',
      isMain: goal.isMain || false,
      isNonFinancial: goal.isNonFinancial || false,
      isCompleted: goal.isCompleted || false,
    });
    setDialogOpen(true);
  };

  const saveGoal = () => {
    if (!form.title) return;
    const targetValue = form.target ? Number(form.target) : 100;
    const monthlyContrib = form.isNonFinancial ? undefined : (form.monthlyContribution ? Number(form.monthlyContribution) : undefined);
    let updated;
    if (editingGoal) {
      updated = {
        ...data,
        goals: data.goals.map(g => g.id === editingGoal.id
          ? { 
              ...g, 
              title: form.title, 
              description: form.description,
              category: form.category, 
              target: targetValue, 
              deadline: form.deadline,
              monthlyContribution: monthlyContrib,
              imageUrl: form.imageUrl,
              isMain: form.isMain,
              isNonFinancial: form.isNonFinancial,
              isCompleted: form.isCompleted,
            }
          : form.isMain ? { ...g, isMain: false } : g
        ),
      };
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        title: form.title,
        description: form.description,
        category: form.category,
        progress: form.isCompleted ? targetValue : 0,
        target: targetValue,
        deadline: form.deadline,
        linkedHabitIds: [],
        monthlyContribution: monthlyContrib,
        imageUrl: form.imageUrl,
        isMain: form.isMain,
        isNonFinancial: form.isNonFinancial,
        isCompleted: form.isCompleted,
      };
      updated = { 
        ...data, 
        goals: form.isMain 
          ? [...data.goals.map(g => ({ ...g, isMain: false })), goal]
          : [...data.goals, goal] 
      };
    }
    setData(updated);
    saveData(updated);
    setDialogOpen(false);
  };

  const deleteGoal = (id: string) => {
    const updated = { ...data, goals: data.goals.filter(g => g.id !== id) };
    setData(updated);
    saveData(updated);
    setSelectedGoal(null);
  };

  const toggleCompleted = (id: string) => {
    const updated = {
      ...data,
      goals: data.goals.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g),
    };
    setData(updated);
    saveData(updated);
    if (selectedGoal?.id === id) {
      setSelectedGoal(null);
    }
  };

  const updateProgress = (id: string, value: number) => {
    const updated = {
      ...data,
      goals: data.goals.map(g => g.id === id ? { ...g, progress: value } : g),
    };
    setData(updated);
    saveData(updated);
    if (selectedGoal?.id === id) {
      setSelectedGoal({ ...selectedGoal, progress: value });
    }
  };

  const getTimeEstimate = (goal: Goal) => {
    const remaining = goal.target - goal.progress;
    if (remaining <= 0) return null;
    const monthly = goal.monthlyContribution || 0;
    if (monthly <= 0) return null;
    const months = remaining / monthly;
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    if (years > 0) return `${years} ano${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    return `${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}`;
  };

  const getAcceleratedEstimate = (goal: Goal) => {
    const remaining = goal.target - goal.progress;
    if (remaining <= 0) return null;
    const monthly = (goal.monthlyContribution || 0) + 300;
    if (monthly <= 0) return null;
    const months = remaining / monthly;
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    if (years > 0) return `${years} ano${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    return `${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}`;
  };

  return (
    <div className="px-4 pt-6 pb-24 safe-bottom max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">METAS</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent text-accent text-sm font-semibold hover:bg-accent/10 transition-colors">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* Main Goal Card */}
      {mainGoal && (
        <div className="mb-6 animate-fade-in">
          <p className="text-primary font-bold text-sm mb-3">Meta Principal</p>
          <div 
            className="bg-secondary rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all relative"
            onClick={() => setSelectedGoal(mainGoal)}
          >
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteGoal(mainGoal.id); }}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 rounded-lg text-white/80 hover:text-destructive hover:bg-black/70 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            
            {/* Image/Gradient */}
            <div 
              className="h-40 relative overflow-hidden bg-gradient-to-br from-primary/80 to-primary/40"
            >
              {mainGoal.imageUrl && !mainGoal.imageUrl.startsWith('color-') ? (
                <img src={mainGoal.imageUrl} alt={mainGoal.title} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Target size={48} className="text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{mainGoal.title}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
                    ATIVO
                  </span>
                </div>
                {mainGoal.description && (
                  <p className="text-xs text-white/70 mt-0.5">{mainGoal.description}</p>
                )}
              </div>
            </div>
            
            {/* Progress */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  {(!mainGoal.isNonFinancial && mainGoal.category === 'financas')
                    ? formatCurrency(mainGoal.progress, data.currency)
                    : mainGoal.progress
                  } / {(!mainGoal.isNonFinancial && mainGoal.category === 'financas')
                    ? formatCurrency(mainGoal.target, data.currency)
                    : mainGoal.target
                  }
                </span>
                <span className="text-lg font-black text-primary">
                  {Math.min(100, (mainGoal.progress / mainGoal.target) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (mainGoal.progress / mainGoal.target) * 100)}%` }} 
                />
              </div>

              {/* Intelligence Analysis */}
              {mainGoal.monthlyContribution && mainGoal.monthlyContribution > 0 && (
                <div className="mt-4 bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Análise de Inteligência</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">No ritmo atual:</span>
                      <span className="font-semibold">{getTimeEstimate(mainGoal) || '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-primary">Com +{formatCurrency(300, data.currency)}/mês:</span>
                      <span className="font-semibold text-primary">{getAcceleratedEstimate(mainGoal) || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={(e) => { e.stopPropagation(); setSelectedGoal(mainGoal); }}
                className="w-full mt-4 bg-primary text-primary-foreground font-semibold"
              >
                AJUSTAR PLANO
              </Button>
            </div>
          </div>
        </div>
      )}

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
      </div>

      {/* Other Goals List */}
      <div className="space-y-3">
        {data.goals.filter(g => !g.isMain).map((goal, index) => {
          const catConfig = CATEGORY_CONFIG[goal.category];
          const pct = Math.min(100, (goal.progress / goal.target) * 100);
          const isGoalCompleted = goal.isCompleted || pct >= 100;

          return (
            <div 
              key={goal.id} 
              className={`bg-secondary rounded-2xl p-4 animate-fade-in cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all relative ${isGoalCompleted ? 'opacity-70' : ''}`}
              onClick={() => setSelectedGoal(goal)}
            >
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompleted(goal.id); }}
                  className={`p-1.5 transition-colors ${isGoalCompleted ? 'text-primary hover:text-muted-foreground' : 'text-muted-foreground hover:text-primary'}`}
                  title={isGoalCompleted ? 'Reativar' : 'Marcar concluída'}
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="flex items-start justify-between mb-2 pr-16">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{goal.title}</h3>
                    {isGoalCompleted && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                        CONCLUÍDA
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ backgroundColor: catConfig.color + '22', color: catConfig.color }}
                  >
                    {catConfig.icon} {catConfig.label}
                  </span>
                </div>
                <span className="text-lg font-black" style={{ color: isGoalCompleted ? 'hsl(var(--primary))' : catConfig.color }}>{pct.toFixed(0)}%</span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: catConfig.color }} />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {(!goal.isNonFinancial && goal.category === 'financas')
                    ? `${formatCurrency(goal.progress, data.currency)} / ${formatCurrency(goal.target, data.currency)}`
                    : `${goal.progress} / ${goal.target}`
                  }
                </span>
                {goal.deadline && <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>}
              </div>
            </div>
          );
        })}

        {data.goals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma meta criada</p>
            <p className="text-xs mt-1">Clique em "Nova Meta" para adicionar</p>
          </div>
        )}
      </div>

      {/* Goal Detail Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)}>
        <DialogContent className="bg-popover border-border max-w-sm">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedGoal.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { openEdit(selectedGoal); setSelectedGoal(null); }} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteGoal(selectedGoal.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all" 
                    style={{ width: `${Math.min(100, (selectedGoal.progress / selectedGoal.target) * 100)}%` }} 
                  />
                </div>
                <p className="text-center text-sm">
                  {(!selectedGoal.isNonFinancial && selectedGoal.category === 'financas')
                    ? `${formatCurrency(selectedGoal.progress, data.currency)} / ${formatCurrency(selectedGoal.target, data.currency)}`
                    : `${selectedGoal.progress} / ${selectedGoal.target}`
                  }
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="number"
                    className="bg-secondary border-border"
                    placeholder="Novo valor"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = Number((e.target as HTMLInputElement).value);
                        if (val >= 0) updateProgress(selectedGoal.id, val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button onClick={() => updateProgress(selectedGoal.id, selectedGoal.progress + 1)} className="shrink-0">+1</Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Digite o valor e pressione Enter para atualizar</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-popover border-border max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Título da meta"
              className="bg-secondary border-border"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              className="bg-secondary border-border resize-none"
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
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

            {/* Non-financial toggle - moved before target */}
            <label className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNonFinancial}
                onChange={e => setForm({ ...form, isNonFinancial: e.target.checked, monthlyContribution: '', target: '' })}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <div>
                <p className="text-xs font-semibold">Meta não financeira</p>
                <p className="text-[10px] text-muted-foreground">Sem valor em dinheiro (ex: estudar, exercitar)</p>
              </div>
            </label>

            {!form.isNonFinancial && (
              <>
                <Input
                  type="number"
                  placeholder="Valor alvo (R$)"
                  className="bg-secondary border-border"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Contribuição mensal (opcional)"
                  className="bg-secondary border-border"
                  value={form.monthlyContribution}
                  onChange={e => setForm({ ...form, monthlyContribution: e.target.value })}
                />
              </>
            )}
            <Input
              type="date"
              className="bg-secondary border-border"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />

            {/* Main goal toggle */}
            <label className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMain}
                onChange={e => setForm({ ...form, isMain: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <div>
                <p className="text-xs font-semibold">Meta Principal</p>
                <p className="text-[10px] text-muted-foreground">Destaque esta meta no topo</p>
              </div>
            </label>

            <Button onClick={saveGoal} className="w-full bg-primary text-primary-foreground font-semibold">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
