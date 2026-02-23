import { useLocation, useNavigate } from "react-router-dom";
import { DollarSign, Calendar, Globe, Target, Menu } from "lucide-react";

const tabs = [
  { path: "/", label: "Finanças", icon: DollarSign },
  { path: "/rotina", label: "Rotina", icon: Calendar },
  { path: "/atlas", label: "Atlas", icon: Globe },
  { path: "/metas", label: "Metas", icon: Target },
  { path: "/menu", label: "Menu", icon: Menu },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-[var(--nav-height)] max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
