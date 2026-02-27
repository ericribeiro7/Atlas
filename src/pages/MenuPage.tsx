import { useState } from "react";
import { User, Bell, Database } from "lucide-react";
import { loadData, saveData } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function MenuPage() {
  const [data, setData] = useState(loadData);

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="px-4 pt-6 safe-bottom max-w-md mx-auto">
      <h1 className="text-2xl font-black tracking-tight mb-6">MENU</h1>

      {/* Perfil simples */}
      <div className="bg-secondary rounded-2xl p-4 mb-4 animate-fade-in flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
          <User className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground uppercase font-semibold">Perfil</p>
          <Input
            className="mt-1 h-8 bg-muted border-none text-sm"
            placeholder="Seu nome"
            value={data.userName}
            onChange={e => {
              const updated = { ...data, userName: e.target.value };
              setData(updated);
              saveData(updated);
            }}
          />
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-secondary rounded-2xl p-4 mb-4 animate-fade-in flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <Bell size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Notificações</p>
            <p className="text-xs text-muted-foreground">Saber se você deseja receber lembretes dos hábitos</p>
          </div>
        </div>
        <Switch
          checked={data.notificationsEnabled}
          onCheckedChange={(v) => {
            const updated = { ...data, notificationsEnabled: Boolean(v) };
            setData(updated);
            saveData(updated);
          }}
        />
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
