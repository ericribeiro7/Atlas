import { useState } from "react";
import { loadData, CATEGORY_CONFIG } from "@/lib/store";

export default function Atlas() {
  const [data] = useState(loadData);

  const areas = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const goals = data.goals.filter(g => g.category === key);
    const habits = data.habits.filter(h => h.category === key);
    const avgProgress = goals.length > 0
      ? goals.reduce((s, g) => s + (g.progress / g.target) * 100, 0) / goals.length
      : 0;
    const habitsCompletedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().slice(0, 10))).length;

    return { key, config, goals: goals.length, habits: habits.length, avgProgress, habitsCompletedToday };
  });

  const overallProgress = areas.length > 0
    ? areas.reduce((s, a) => s + a.avgProgress, 0) / areas.length
    : 0;

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight mb-6">ATLAS</h1>

      {/* Overall */}
      <div className="card-gradient-savings rounded-2xl p-5 mb-6 animate-fade-in text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Progresso Geral de Vida</p>
        <p className="text-4xl font-black text-primary">{overallProgress.toFixed(0)}%</p>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Area Cards */}
      <div className="grid grid-cols-2 gap-3">
        {areas.map(area => (
          <div
            key={area.key}
            className="bg-secondary rounded-2xl p-4 animate-fade-in"
          >
            <div className="text-3xl mb-2">{area.config.icon}</div>
            <h3 className="font-bold text-sm mb-1">{area.config.label}</h3>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${area.avgProgress}%`, backgroundColor: area.config.color }}
              />
            </div>
            <p className="text-lg font-black" style={{ color: area.config.color }}>
              {area.avgProgress.toFixed(0)}%
            </p>
            <div className="mt-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{area.goals} metas ativas</p>
              <p className="text-[10px] text-muted-foreground">{area.habitsCompletedToday}/{area.habits} hábitos hoje</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
