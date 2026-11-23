import { useState } from 'react';
import { AlertTriangle, Calendar, CheckSquare, RotateCcw, Square } from 'lucide-react';
import {
  EXAM_CHECKLIST_ITEMS,
  EXAM_DATE_DISPLAY,
  QUICK_CHEATSHEET_CARDS,
} from '../../data/examChecklist';
import { useGameProgress } from '../../hooks/useGameProgress';
import { Modal } from '../ui/Modal';
import { TactileButton } from '../ui/TactileButton';

export function ExamDayView() {
  const { progress, toggleChecklistItem, resetProgress } = useGameProgress();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const checkedCount = EXAM_CHECKLIST_ITEMS.filter(
    (item) => progress.examChecklist[item.id]
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Banner da Data */}
      <div className="rounded-3xl border-2 border-[#14B8A6]/50 bg-[#131C26] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#14B8A6]/15 border border-[#14B8A6]/40 px-2.5 py-1 text-xs font-display font-extrabold text-[#4CE4D2]">
            <Calendar className="h-3.5 w-3.5" />
            Prova Online — {EXAM_DATE_DISPLAY}
          </span>
          <h1 className="text-2xl font-display font-extrabold text-[#E8F1F8]">
            Checklist Operacional & Cola Rápida
          </h1>
          <p className="text-sm text-[#92A8BE]">
            Evite perdas bobas por desconexão ou mudança de aba e revise os pontos-chave antes da prova.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0B1117]/80 border border-[#28384A] px-4 py-3 text-center shrink-0">
          <p className="text-[11px] font-bold uppercase text-[#92A8BE]">Preparo Técnico</p>
          <p className="font-display text-2xl font-extrabold text-[#14B8A6]">
            {checkedCount}/{EXAM_CHECKLIST_ITEMS.length}
          </p>
        </div>
      </div>

      {/* Checklist Interativo */}
      <section className="space-y-3">
        {EXAM_CHECKLIST_ITEMS.map((item) => {
          const checked = Boolean(progress.examChecklist[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleChecklistItem(item.id)}
              className={`w-full flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                checked
                  ? 'border-[#58CC02]/60 bg-[#58CC02]/10'
                  : 'border-[#28384A] bg-[#131C26] hover:border-[#3D556E]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {checked ? (
                  <CheckSquare className="h-6 w-6 text-[#58CC02]" />
                ) : (
                  <Square className="h-6 w-6 text-[#92A8BE]" />
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <h2
                  className={`font-display text-base font-extrabold ${
                    checked ? 'text-[#86F23B] line-through' : 'text-[#E8F1F8]'
                  }`}
                >
                  {item.title}
                </h2>
                <p className="text-sm text-[#C7D7E6]">{item.detail}</p>
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFC800]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.criticalNote}</span>
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Cola Rápida de Revisão Final */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-extrabold text-[#E8F1F8]">
          Resumo de Bolso (Revisão de Véspera)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_CHEATSHEET_CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-3xl border-2 border-[#28384A] bg-[#131C26] p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-extrabold text-[#E8F1F8]">
                  {card.title}
                </h3>
                <span
                  className="rounded-lg px-2 py-0.5 text-[11px] font-display font-extrabold"
                  style={{
                    backgroundColor: `${card.accentColor}22`,
                    color: card.accentColor,
                  }}
                >
                  {card.badge}
                </span>
              </div>

              <div className="space-y-2">
                {card.rows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl bg-[#0B1117]/70 border border-[#28384A]/80 px-3 py-2 text-xs"
                  >
                    <p className="font-bold text-[#92A8BE]">{row.label}</p>
                    <p className="mt-0.5 font-semibold text-[#E8F1F8]">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gerenciar Progresso */}
      <div className="rounded-2xl border border-[#28384A] bg-[#131C26]/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[#92A8BE]">
          Quer recomeçar sua revisão do zero para testar uma segunda passada completa no edital?
        </p>
        <TactileButton
          variant="outline"
          size="sm"
          onClick={() => setConfirmResetOpen(true)}
          className="shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reiniciar Progresso</span>
        </TactileButton>
      </div>

      <Modal
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reiniciar todo o progresso?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#92A8BE]">
            Isso apagará seu XP, ofensiva, lições concluídas e histórico de simulados neste dispositivo.
          </p>
          <div className="flex gap-3">
            <TactileButton
              variant="outline"
              fullWidth
              onClick={() => setConfirmResetOpen(false)}
            >
              Cancelar
            </TactileButton>
            <TactileButton
              variant="danger"
              fullWidth
              onClick={() => {
                resetProgress();
                setConfirmResetOpen(false);
              }}
            >
              Sim, Reiniciar
            </TactileButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
