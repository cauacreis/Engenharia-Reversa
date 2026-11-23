import { useEffect, useState } from 'react';
import { BookmarkCheck, KeyRound, Play, Sparkles, Trash2 } from 'lucide-react';
import { getUnitMeta, UNITS } from '../../data/questions';
import {
  buildOfflineQuestionsFallback,
  deleteAIPack,
  generateQuestionsWithGroq,
  getGroqApiKey,
  GroqServiceError,
  loadSavedAIPacks,
  saveAIPack,
} from '../../services/groqTutorService';
import { Question, SavedAIQuestionPack, UnitId } from '../../types/quiz';
import { Mascot, MascotMood } from '../Mascot';
import { Modal } from '../ui/Modal';
import { TactileButton } from '../ui/TactileButton';

export type GeneratorScope = UnitId | 'geral';

interface AIQuestionGeneratorModalProps {
  open: boolean;
  initialScope?: GeneratorScope;
  initialCount?: number;
  initialMode?: 'lesson' | 'simulado';
  onClose: () => void;
  onStartGeneratedSession: (params: {
    title: string;
    mode: 'lesson' | 'simulado';
    scope: UnitId | 'geral';
    durationMinutes?: number;
    questions: Question[];
  }) => void;
  onOpenSettings: () => void;
}

const SCOPE_OPTIONS: Array<{ id: GeneratorScope; label: string; defaultCount: number }> = [
  { id: 'geral', label: 'Geral Ponderado (20q)', defaultCount: 20 },
  { id: 'portugues', label: 'Só Português', defaultCount: 5 },
  { id: 'matematica', label: 'Só Lógica & Mat', defaultCount: 5 },
  { id: 'informatica', label: 'Só Informática', defaultCount: 5 },
  { id: 'saneago', label: 'Só Saneago & GO', defaultCount: 5 },
];

export function AIQuestionGeneratorModal({
  open,
  initialScope = 'geral',
  initialCount = 20,
  initialMode = 'simulado',
  onClose,
  onStartGeneratedSession,
  onOpenSettings,
}: AIQuestionGeneratorModalProps) {
  const [scope, setScope] = useState<GeneratorScope>(initialScope);
  const [count, setCount] = useState<number>(initialCount);
  const [sessionMode, setSessionMode] = useState<'lesson' | 'simulado'>(initialMode);
  const [saveToCache, setSaveToCache] = useState(true);
  const [savedPacks, setSavedPacks] = useState<SavedAIQuestionPack[]>([]);

  const [generating, setGenerating] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);

  useEffect(() => {
    if (!open) return;
    setScope(initialScope);
    setCount(initialCount);
    setSessionMode(initialMode);
    setSavedPacks(loadSavedAIPacks());
    setNotice(null);
    setMissingKey(false);
    setMascotMood('idle');
  }, [initialCount, initialMode, initialScope, open]);

  const scopeLabel =
    scope === 'geral' ? 'Geral Ponderado' : getUnitMeta(scope).title;

  const handleGenerate = async () => {
    setGenerating(true);
    setMascotMood('thinking');
    setNotice(null);
    setMissingKey(false);

    const hasKey = Boolean(getGroqApiKey());
    if (!hasKey) {
      setMissingKey(true);
      setMascotMood('sad');
      setNotice(
        'Nenhuma chave API da Groq encontrada. Configure sua chave gratuita ou monte um simulado/treino inédito usando o banco offline de 80 questões.'
      );
      setGenerating(false);
      return;
    }

    try {
      const { questions, modelUsed } = await generateQuestionsWithGroq({
        scope,
        count,
      });

      const title =
        sessionMode === 'simulado'
          ? `Simulado IA • ${scopeLabel} (${questions.length}q)`
          : `Treino IA • ${scopeLabel} (${questions.length}q)`;

      if (saveToCache) {
        const updated = saveAIPack({
          id: `pack-${Date.now()}`,
          title,
          scope,
          mode: sessionMode,
          createdAt: new Date().toISOString(),
          modelUsed,
          questions,
        });
        setSavedPacks(updated);
      }

      setMascotMood('happy');
      onStartGeneratedSession({
        title,
        mode: sessionMode,
        scope,
        durationMinutes: sessionMode === 'simulado' ? (count >= 20 ? 25 : 10) : undefined,
        questions,
      });
      onClose();
    } catch (err) {
      setMascotMood('sad');
      if (err instanceof GroqServiceError && err.code === 'MISSING_KEY') {
        setMissingKey(true);
      }
      setNotice(
        err instanceof Error
          ? `${err.message} Você ainda pode iniciar uma rodada com questões do banco offline.`
          : 'Não foi possível gerar via Groq agora. Use o botão offline abaixo para continuar estudando.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleStartOfflineFallback = () => {
    const questions = buildOfflineQuestionsFallback({
      scope,
      count,
    });
    const title =
      sessionMode === 'simulado'
        ? `Simulado Extra • ${scopeLabel} (${questions.length}q)`
        : `Treino Extra • ${scopeLabel} (${questions.length}q)`;

    onStartGeneratedSession({
      title,
      mode: sessionMode,
      scope,
      durationMinutes: sessionMode === 'simulado' ? (count >= 20 ? 25 : 10) : undefined,
      questions,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gerador IA — Edital SANEAGO 001/2026"
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-5">
        <Mascot
          mood={mascotMood}
          size="sm"
          accentColor="#00B8FF"
          speechTitle="Pingo • Gerador Patativa"
          speech={
            generating
              ? `Elaborando ${count} questões inéditas ancoradas no Edital 001/2026...`
              : 'Escolha o foco e o modo abaixo. Tudo gerado fica validado antes de abrir!'
          }
        />

        {/* Seleção de Foco */}
        <div className="space-y-2">
          <p className="text-xs font-display font-extrabold uppercase tracking-wider text-[#92A8BE]">
            1. Foco do Conteúdo
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCOPE_OPTIONS.map((opt) => {
              const active = scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setScope(opt.id);
                    setCount(opt.defaultCount);
                  }}
                  className={`rounded-xl border-2 px-3 py-2 text-xs font-display font-bold text-left transition-all ${
                    active
                      ? 'border-[#00B8FF] bg-[#00B8FF]/15 text-[#61D5FF]'
                      : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantidade & Modo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-display font-extrabold uppercase tracking-wider text-[#92A8BE]">
              2. Quantidade
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setCount(qty)}
                  className={`rounded-xl border-2 py-2 font-display text-xs font-extrabold transition-colors ${
                    count === qty
                      ? 'border-[#FFC800] bg-[#FFC800]/15 text-[#FFC800]'
                      : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE] hover:text-white'
                  }`}
                >
                  {qty}q
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-display font-extrabold uppercase tracking-wider text-[#92A8BE]">
              3. Formato
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSessionMode('simulado')}
                className={`rounded-xl border-2 py-2 px-2 font-display text-xs font-extrabold transition-colors ${
                  sessionMode === 'simulado'
                    ? 'border-[#FFC800] bg-[#FFC800]/15 text-[#FFC800]'
                    : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE]'
                }`}
              >
                Simulado
              </button>
              <button
                type="button"
                onClick={() => setSessionMode('lesson')}
                className={`rounded-xl border-2 py-2 px-2 font-display text-xs font-extrabold transition-colors ${
                  sessionMode === 'lesson'
                    ? 'border-[#58CC02] bg-[#58CC02]/15 text-[#86F23B]'
                    : 'border-[#28384A] bg-[#0B1117]/75 text-[#92A8BE]'
                }`}
              >
                Treino c/ Dicas
              </button>
            </div>
          </div>
        </div>

        {/* Opção de salvar no navegador */}
        <label className="flex items-center gap-2.5 rounded-2xl border border-[#28384A] bg-[#0B1117]/70 px-3.5 py-2.5 text-xs text-[#C7D7E6] cursor-pointer">
          <input
            type="checkbox"
            checked={saveToCache}
            onChange={(e) => setSaveToCache(e.target.checked)}
            className="h-4 w-4 accent-[#00B8FF]"
          />
          <BookmarkCheck className="h-4 w-4 text-[#00B8FF] shrink-0" />
          <span>Salvar pacote gerado neste navegador para refazer sem gastar tokens</span>
        </label>

        {notice && (
          <div className="rounded-2xl border border-[#FF9600]/50 bg-[#FF9600]/10 p-3.5 space-y-2.5 text-xs text-[#FFD89E]">
            <p>{notice}</p>
            <div className="flex flex-wrap gap-2">
              {missingKey && (
                <TactileButton
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Configurar Chave Groq</span>
                </TactileButton>
              )}
              <TactileButton
                size="sm"
                variant="outline"
                onClick={handleStartOfflineFallback}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Montar com Banco Offline (80q)</span>
              </TactileButton>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={generating}
            onClick={() => void handleGenerate()}
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {generating
                ? 'Gerando com Groq...'
                : `Gerar ${count} Questões com IA`}
            </span>
          </TactileButton>
        </div>

        {/* Pacotes já salvos */}
        {savedPacks.length > 0 && (
          <div className="border-t border-[#28384A] pt-4 space-y-2">
            <p className="text-xs font-display font-extrabold uppercase tracking-wider text-[#92A8BE]">
              Pacotes Salvos ({savedPacks.length})
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {savedPacks.map((pack) => {
                const unitColor =
                  pack.scope === 'geral' || pack.scope === 'corretivo'
                    ? '#FFC800'
                    : UNITS.find((u) => u.id === pack.scope)?.accentColor ?? '#00B8FF';
                return (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#28384A] bg-[#0B1117]/75 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#E8F1F8] truncate">{pack.title}</p>
                      <p className="text-[11px] text-[#92A8BE]">
                        <span style={{ color: unitColor }}>{pack.questions.length} questões</span>
                        {pack.modelUsed ? ` • ${pack.modelUsed}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <TactileButton
                        size="sm"
                        variant="success"
                        onClick={() => {
                          onStartGeneratedSession({
                            title: pack.title,
                            mode: pack.mode,
                            scope: pack.scope === 'corretivo' ? 'geral' : pack.scope,
                            durationMinutes:
                              pack.mode === 'simulado'
                                ? pack.questions.length >= 20
                                  ? 25
                                  : 10
                                : undefined,
                            questions: pack.questions,
                          });
                          onClose();
                        }}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Abrir</span>
                      </TactileButton>
                      <button
                        type="button"
                        onClick={() => setSavedPacks(deleteAIPack(pack.id))}
                        aria-label="Excluir pacote salvo"
                        className="p-2 rounded-xl text-[#92A8BE] hover:text-[#FF8585] hover:bg-[#1D2A38]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
