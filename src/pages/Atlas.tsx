import { useState, useMemo } from "react";
import { loadData, CATEGORY_CONFIG } from "@/lib/store";
import { Flame, Target, TrendingUp, Calendar, Award, AlertTriangle } from "lucide-react";

const WEEKDAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export default function Atlas() {
  const [data] = useState(loadData);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Calculate area stats
  const areas = useMemo(() => Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const goals = data.goals.filter(g => g.category === key);
    const habits = data.habits.filter(h => h.category === key);
    const avgProgress = goals.length > 0
      ? goals.reduce((s, g) => s + (g.progress / g.target) * 100, 0) / goals.length
      : habits.length > 0 ? 50 : 0;
    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);
    return { key, config, goals: goals.length, habits: habits.length, avgProgress, totalCompletions };
  }), [data]);

  // Life score (average of all areas that have activity)
  const activeAreas = areas.filter(a => a.goals > 0 || a.habits > 0);
  const lifeScore = activeAreas.length > 0
    ? activeAreas.reduce((s, a) => s + a.avgProgress, 0) / activeAreas.length
    : 0;

  // Best and worst areas
  const sortedAreas = [...activeAreas].sort((a, b) => b.avgProgress - a.avgProgress);
  const bestArea = sortedAreas[0];
  const needsAttentionArea = sortedAreas[sortedAreas.length - 1];

  // Weekly activity heatmap - Monday to Sunday of current week
  const weeklyActivity = useMemo(() => {
    const weekDays: { date: string; dayIndex: number; count: number }[] = [];
    // Get Monday of current week
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    
    // Generate Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = data.habits.reduce((s, h) => s + (h.completedDates.includes(dateStr) ? 1 : 0), 0);
      weekDays.push({ date: dateStr, dayIndex: i, count }); // 0=Mon, 1=Tue... 6=Sun
    }
    return weekDays;
  }, [data, today]);

  const maxWeeklyCount = Math.max(...weeklyActivity.map(d => d.count), 1);
  const totalWeeklyCompletions = weeklyActivity.reduce((s, d) => s + d.count, 0);

  // Calculate longest streak
  const longestStreak = useMemo(() => {
    let maxStreak = 0;
    data.habits.forEach(habit => {
      const dates = [...habit.completedDates].sort();
      let currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }
      if (dates.length === 1) maxStreak = Math.max(maxStreak, 1);
    });
    return maxStreak;
  }, [data]);

  // Activities done today
  const activitiesToday = data.habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalActivities = data.habits.length;

  // Goals progress
  const completedGoals = data.goals.filter(g => g.progress >= g.target).length;
  const totalGoals = data.goals.length;

  return (
    <div className="px-4 pt-6 pb-24 safe-bottom max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight mb-6">ATLAS</h1>

      {/* Life Score */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-6 mb-6 animate-fade-in text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Pontuação de Vida</p>
        <p className="text-6xl font-black text-primary mb-2">{lifeScore.toFixed(0)}</p>
        <p className="text-sm text-muted-foreground">de 100 pontos</p>
        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${lifeScore}%` }} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-secondary rounded-2xl p-3 text-center animate-fade-in">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-black">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Maior Streak</p>
        </div>
        <div className="bg-secondary rounded-2xl p-3 text-center animate-fade-in">
          <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-black">{totalWeeklyCompletions}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Esta Semana</p>
        </div>
        <div className="bg-secondary rounded-2xl p-3 text-center animate-fade-in">
          <Target className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-xl font-black">{completedGoals}/{totalGoals}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Metas</p>
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="bg-secondary rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3">Atividade da Semana</h3>
        <div className="flex justify-between gap-2">
          {weeklyActivity.map((day, i) => {
            const intensity = day.count / maxWeeklyCount;
            const isToday = day.date === todayStr;
            return (
              <div key={i} className="flex-1 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">{WEEKDAY_LABELS[day.dayIndex]}</p>
                <div
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isToday ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    backgroundColor: day.count > 0 
                      ? `hsl(142, 60%, ${60 - intensity * 30}%)`
                      : 'hsl(var(--muted))',
                    color: day.count > 0 ? 'white' : 'hsl(var(--muted-foreground))'
                  }}
                >
                  {day.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best & Needs Attention Areas */}
      {activeAreas.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {bestArea && (
            <div className="bg-secondary rounded-2xl p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Melhor Área</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{bestArea.config.icon}</span>
                <div>
                  <p className="font-bold text-sm">{bestArea.config.label}</p>
                  <p className="text-lg font-black" style={{ color: bestArea.config.color }}>
                    {bestArea.avgProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
          {needsAttentionArea && needsAttentionArea !== bestArea && (
            <div className="bg-secondary rounded-2xl p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Precisa Atenção</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{needsAttentionArea.config.icon}</span>
                <div>
                  <p className="font-bold text-sm">{needsAttentionArea.config.label}</p>
                  <p className="text-lg font-black" style={{ color: needsAttentionArea.config.color }}>
                    {needsAttentionArea.avgProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Areas Summary */}
      <div className="bg-secondary rounded-2xl p-4 animate-fade-in">
        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4">Visão Geral</h3>
        <div className="space-y-3">
          {areas.map(area => (
            <div key={area.key} className="flex items-center gap-3">
              <span className="text-xl w-8">{area.config.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{area.config.label}</span>
                  <span className="text-xs font-bold" style={{ color: area.config.color }}>
                    {area.avgProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${area.avgProgress}%`, backgroundColor: area.config.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational tip */}
      {activitiesToday === 0 && totalActivities > 0 && (
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-2xl p-4 animate-fade-in">
          <p className="text-sm text-primary font-semibold mb-1">💡 Dica do dia</p>
          <p className="text-xs text-muted-foreground">
            Você ainda não completou nenhuma atividade hoje. Que tal começar com a mais fácil?
          </p>
        </div>
      )}

      {activeAreas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground mt-6">
          <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Comece adicionando atividades e metas</p>
          <p className="text-xs mt-1">Seu progresso aparecerá aqui</p>
        </div>
      )}
    </div>
  );
}
