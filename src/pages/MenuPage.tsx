import { useState } from "react";
import { User, DollarSign, Bell, Palette, Database, ChevronRight } from "lucide-react";
import { loadData, saveData } from "@/lib/store";
import { Input } from "@/components/ui/input";

export default function MenuPage() {
  const [data, setData] = useState(loadData);

  const updateBudget = (value: string) => {
    const updated = { ...data, monthlyBudget: Number(value) };
    setData(updated);
    saveData(updated);
  };

  const updateReserve = (value: string) => {
    const updated = { ...data, initialReserve: Number(value) };
    setData(updated);
    saveData(updated);
  };

  const updateCurrency = (value: string) => {
    const updated = { ...data, currency: value };
    setData(updated);
    saveData(updated);
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const items = [
    { icon: User, label: 'Perfil', desc: 'Suas informações pessoais' },
    { icon: Bell, label: 'Notificações', desc: 'Lembretes e alertas' },
    { icon: Palette, label: 'Aparência', desc: 'Tema e personalização' },
  ];

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight mb-6">MENU</h1>

      {/* Settings Items */}
      <div className="space-y-2 mb-6">
        {items.map(item => (
          <button key={item.label} className="w-full flex items-center gap-4 bg-secondary rounded-2xl p-4 text-left hover:bg-muted transition-colors animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <item.icon size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Finance Settings */}
      <div className="bg-secondary rounded-2xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign size={18} className="text-primary" />
          <h3 className="font-bold text-sm">Configurações Financeiras</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Moeda</label>
            <select
              className="w-full py-2 px-3 rounded-lg bg-muted text-foreground border-none text-sm"
              value={data.currency}
              onChange={e => updateCurrency(e.target.value)}
            >
              <option value="R$">R$ (Real)</option>
              <option value="$">$ (Dólar)</option>
              <option value="€">€ (Euro)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Orçamento Mensal</label>
            <Input
              type="number"
              className="bg-muted border-none"
              value={data.monthlyBudget}
              onChange={e => updateBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Reserva Inicial</label>
            <Input
              type="number"
              className="bg-muted border-none"
              value={data.initialReserve}
              onChange={e => updateReserve(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-secondary rounded-2xl p-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Database size={18} className="text-destructive" />
          <h3 className="font-bold text-sm">Dados</h3>
        </div>
        <button onClick={clearData} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors">
          Limpar todos os dados
        </button>
      </div>
    </div>
  );
}
