import React from 'react';
import { ClipboardCheck, Compass, RotateCcw, Trophy } from 'lucide-react';
import { AppTab } from '../../types/quiz';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  mistakeCount: number;
  unlockedSimuladosCount: number;
}

interface NavItem {
  id: AppTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  mistakeCount,
  unlockedSimuladosCount,
}: BottomNavProps) {
  const items: NavItem[] = [
    { id: 'trilha', label: 'Trilha de Estudos', shortLabel: 'Trilha', icon: Compass },
    {
      id: 'erros',
      label: 'Revisão de Erros',
      shortLabel: 'Erros',
      icon: RotateCcw,
      badge: mistakeCount > 0 ? mistakeCount : undefined,
      badgeColor: 'bg-[#FF4B4B] text-white',
    },
    {
      id: 'simulados',
      label: 'Simulados Patativa',
      shortLabel: 'Simulados',
      icon: Trophy,
      badge: unlockedSimuladosCount > 0 ? unlockedSimuladosCount : undefined,
      badgeColor: 'bg-[#FFC800] text-[#1D1500]',
    },
    { id: 'prova', label: 'Dia da Prova', shortLabel: 'Prova', icon: ClipboardCheck },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:border-r md:border-[#28384A] md:bg-[#0B1117] md:px-4 md:py-6">
        <nav aria-label="Navegação principal" className="space-y-2 sticky top-24">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left font-display font-bold text-sm transition-all border-2 ${
                  isActive
                    ? 'bg-[#00B8FF]/15 border-[#00B8FF]/60 text-[#E8F1F8] shadow-[0_3px_0_0_rgba(0,136,194,0.35)]'
                    : 'bg-transparent border-transparent text-[#92A8BE] hover:bg-[#131C26] hover:text-[#E8F1F8]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'text-[#00B8FF]' : 'text-[#92A8BE]'}`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full px-1.5 text-xs font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[#28384A] bg-[#0B1117]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 transition-colors ${
                  isActive
                    ? 'bg-[#00B8FF]/15 text-[#00B8FF]'
                    : 'text-[#92A8BE] hover:text-[#E8F1F8]'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-display font-bold leading-none">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
