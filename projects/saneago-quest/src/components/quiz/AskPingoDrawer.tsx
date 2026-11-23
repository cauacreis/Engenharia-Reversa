import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  KeyRound,
  Send,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { getUnitMeta } from '../../data/questions';
import {
  askPingoAboutQuestion,
  getGroqApiKey,
  GroqServiceError,
  PingoChatMessage,
} from '../../services/groqTutorService';
import { Question } from '../../types/quiz';
import { Mascot } from '../Mascot';
import { TactileButton } from '../ui/TactileButton';

export interface AskPingoContext {
  question: Question;
  selectedOption: string;
  correctLabel: string;
  isCorrect: boolean;
}

interface AskPingoDrawerProps {
  open: boolean;
  context: AskPingoContext | null;
  keyRefreshTick?: number;
  onClose: () => void;
  onOpenSettings: () => void;
}

const QUICK_CHIPS = [
  'Por que as outras alternativas estão erradas?',
  'Me dá outro exemplo prático dessa regra',
  'Como lembrar disso na hora da prova?',
] as const;

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={`b-${idx}`} className="font-extrabold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={`c-${idx}`}
          className="rounded bg-[#1D2A38] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#61D5FF]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={`t-${idx}`}>{token}</React.Fragment>;
  });
}

function RichPingoText({ text }: { text: string }) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, arr) => line.trim() !== '' || (index > 0 && arr[index - 1].trim() !== ''));

  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (keyPrefix: string) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={keyPrefix} className="space-y-1.5 pl-1">
        {bulletBuffer.map((item, idx) => (
          <li key={`${keyPrefix}-${idx}`} className="flex items-start gap-2 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00B8FF]" />
            <span>{renderInlineFormatting(item)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushBullets(`ul-${idx}`);
      return;
    }

    const headingMatch = trimmed.match(/^#{1,3}\s+(.*)$/);
    if (headingMatch) {
      flushBullets(`ul-before-h-${idx}`);
      blocks.push(
        <p key={`h-${idx}`} className="font-display font-extrabold text-white pt-1">
          {renderInlineFormatting(headingMatch[1])}
        </p>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }

    flushBullets(`ul-before-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  flushBullets('ul-end');

  return <div className="space-y-2 text-xs sm:text-sm text-[#DCE9F5]">{blocks}</div>;
}

function buildCompactPromptSummary(question: Question): string {
  if (question.type === 'fill-blank') {
    const filled = `${question.sentenceBefore ? `${question.sentenceBefore} ` : ''}___ ${question.sentenceAfter}`.trim();
    return `${question.prompt} "${filled}"`;
  }
  if (question.type === 'true-false') {
    return `${question.prompt} "${question.statement}"`;
  }
  return question.prompt;
}

export function AskPingoDrawer({
  open,
  context,
  keyRefreshTick = 0,
  onClose,
  onOpenSettings,
}: AskPingoDrawerProps) {
  const [historyByQuestionId, setHistoryByQuestionId] = useState<
    Record<string, PingoChatMessage[]>
  >({});
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    needsKey: boolean;
  } | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(getGroqApiKey()));

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const questionId = context?.question.id ?? '';
  const messages = questionId ? historyByQuestionId[questionId] ?? [] : [];

  useEffect(() => {
    setHasApiKey(Boolean(getGroqApiKey()));
    if (open) {
      setErrorInfo(null);
    }
  }, [keyRefreshTick, open]);

  useEffect(() => {
    setExpandedPrompt(false);
    setErrorInfo(null);
    setInputText('');
  }, [questionId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        document.querySelectorAll('[role="dialog"]').length <= 1
      ) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || (messages.length === 0 && !loading)) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [loading, messages.length, open]);

  const sendQuestion = useCallback(
    async (rawPrompt: string) => {
      const prompt = rawPrompt.trim();
      if (!prompt || !context || loading) return;

      const currentKey = getGroqApiKey();
      setHasApiKey(Boolean(currentKey));
      if (!currentKey) {
        setErrorInfo({
          message:
            'Configure sua chave gratuita da Groq nas Configurações para o Pingo analisar esta questão ao vivo com você.',
          needsKey: true,
        });
        return;
      }

      const qId = context.question.id;
      const previousHistory = historyByQuestionId[qId] ?? [];
      const userMsg: PingoChatMessage = { role: 'user', content: prompt };

      setHistoryByQuestionId((prev) => ({
        ...prev,
        [qId]: [...(prev[qId] ?? []), userMsg],
      }));
      setInputText('');
      setErrorInfo(null);
      setLoading(true);

      try {
        const res = await askPingoAboutQuestion({
          question: context.question,
          selectedOption: context.selectedOption,
          history: previousHistory,
          userPrompt: prompt,
        });

        setHistoryByQuestionId((prev) => ({
          ...prev,
          [qId]: [
            ...(prev[qId] ?? []),
            { role: 'assistant', content: res.answer },
          ],
        }));
      } catch (err) {
        const needsKey =
          err instanceof GroqServiceError &&
          (err.code === 'MISSING_KEY' || err.code === 'AUTH_ERROR');
        setErrorInfo({
          message:
            err instanceof Error
              ? err.message
              : 'Não foi possível consultar o Pingo agora. Tente novamente.',
          needsKey,
        });
      } finally {
        setLoading(false);
        window.setTimeout(() => {
          inputRef.current?.focus();
        }, 40);
      }
    },
    [context, historyByQuestionId, loading]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendQuestion(inputText);
  };

  const unitMeta = context ? getUnitMeta(context.question.unitId) : null;
  const promptSummary = context ? buildCompactPromptSummary(context.question) : '';
  const showExpandToggle = promptSummary.length > 105;

  return (
    <AnimatePresence>
      {open && context && unitMeta && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center overflow-hidden sm:items-stretch sm:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Pergunte ao Pingo"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl border-2 border-[#28384A] bg-[#131C26] shadow-2xl sm:h-full sm:max-w-lg sm:rounded-none sm:rounded-l-3xl"
          >
            {/* Barra de acento */}
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#00B8FF] via-[#14B8A6] to-[#58CC02]" />

            {/* Cabeçalho */}
            <div className="shrink-0 flex items-center justify-between gap-3 border-b border-[#28384A] px-4 pt-4 pb-3 sm:px-5">
              <div className="flex items-center gap-3 min-w-0">
                <Mascot
                  mood={loading ? 'thinking' : 'teaching'}
                  size="sm"
                  accentColor="#00B8FF"
                />
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-[#E8F1F8] truncate">
                    Pergunte ao Pingo
                  </h2>
                  <p className="text-xs text-[#61D5FF] font-semibold truncate">
                    {loading
                      ? 'Pingo está analisando sua dúvida...'
                      : 'Tutor rápido • Banca Patativa (Edital 001/2026)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar chat do Pingo"
                className="shrink-0 rounded-xl p-1.5 text-[#92A8BE] hover:bg-[#1D2A38] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumo compacto da questão */}
            <div className="shrink-0 border-b border-[#28384A] bg-[#0B1117]/80 px-4 py-3 sm:px-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span
                    className="rounded-lg px-2 py-0.5 text-[11px] font-display font-extrabold"
                    style={{
                      backgroundColor: unitMeta.softBg,
                      color: unitMeta.accentColor,
                    }}
                  >
                    {unitMeta.shortTitle}
                  </span>
                  <span className="truncate max-w-[190px] sm:max-w-[240px] rounded-lg border border-[#28384A] bg-[#131C26] px-2 py-0.5 text-[11px] font-bold text-[#92A8BE]">
                    {context.question.topic}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-display font-extrabold ${
                    context.isCorrect
                      ? 'bg-[#58CC02]/15 text-[#86F23B]'
                      : 'bg-[#FF4B4B]/15 text-[#FF8585]'
                  }`}
                >
                  {context.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Acertou</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      <span>Errou</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1">
                <p
                  className={`text-xs font-semibold text-[#E8F1F8] leading-snug ${
                    expandedPrompt ? '' : 'line-clamp-2'
                  }`}
                >
                  {promptSummary}
                </p>
                {showExpandToggle && (
                  <button
                    type="button"
                    onClick={() => setExpandedPrompt((prev) => !prev)}
                    className="text-[11px] font-bold text-[#00B8FF] hover:underline"
                  >
                    {expandedPrompt ? 'Recolher enunciado' : 'Ver completo'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <p className="text-[#92A8BE]">
                  Você marcou:{' '}
                  <span
                    className={`font-bold ${
                      context.isCorrect ? 'text-[#86F23B]' : 'text-[#FF8585]'
                    }`}
                  >
                    {context.selectedOption}
                  </span>
                </p>
                {!context.isCorrect && (
                  <p className="text-[#92A8BE]">
                    Gabarito:{' '}
                    <span className="font-bold text-[#86F23B]">
                      {context.correctLabel}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Área rolável de mensagens + Chips + Fallback sem chave */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4">
              {/* Banner amigável caso não haja chave API */}
              {!hasApiKey && (
                <div className="rounded-2xl border-2 border-[#FFC800]/45 bg-[#FFC800]/10 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Mascot mood="idle" size="sm" accentColor="#FFC800" />
                    <div className="space-y-1 min-w-0">
                      <p className="font-display text-sm font-extrabold text-[#FFE58F]">
                        Ative o chat gratuito com o Pingo
                      </p>
                      <p className="text-xs text-[#F5DFA0] leading-relaxed">
                        Nenhuma chave da Groq foi configurada neste navegador ainda. Adicione sua chave gratuita para tirar dúvidas ao vivo sobre cada alternativa!
                      </p>
                    </div>
                  </div>
                  <TactileButton
                    size="sm"
                    variant="gold"
                    fullWidth
                    onClick={onOpenSettings}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Configurar Chave API Groq</span>
                  </TactileButton>
                </div>
              )}

              {/* Mensagem de boas-vindas do Pingo + Chips rápidos */}
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[#28384A] bg-[#0B1117]/80 p-3.5 text-xs sm:text-sm text-[#C7D7E6] leading-relaxed">
                    <span className="font-bold text-[#61D5FF]">Pingo: </span>
                    Ficou com dúvida nessa questão de{' '}
                    <strong className="text-white">{context.question.topic}</strong>? Escolha uma pergunta rápida abaixo ou escreva sua dúvida com suas palavras!
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-display font-extrabold uppercase tracking-wider text-[#92A8BE]">
                      Perguntas rápidas (1 clique)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          disabled={loading}
                          onClick={() => void sendQuestion(chip)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#00B8FF]/45 bg-[#0B1117] px-3 py-2 text-left text-xs font-bold text-[#8FE2FF] hover:border-[#00B8FF] hover:bg-[#00B8FF]/10 disabled:opacity-50 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00B8FF]" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Histórico da conversa */}
              {messages.length > 0 && (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div
                      key={`msg-${idx}`}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 ${
                          msg.role === 'user'
                            ? 'bg-[#00B8FF]/20 border border-[#00B8FF]/50 text-xs sm:text-sm font-semibold text-[#E8F1F8]'
                            : 'bg-[#0B1117] border border-[#28384A] text-xs sm:text-sm'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="space-y-1.5">
                            <span className="block font-display text-[11px] font-extrabold uppercase tracking-wider text-[#61D5FF]">
                              Pingo
                            </span>
                            <RichPingoText text={msg.content} />
                          </div>
                        ) : (
                          <span>{msg.content}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Atalhos compactos continuam disponíveis após a 1ª pergunta */}
                  {!loading && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {QUICK_CHIPS.map((chip) => (
                        <button
                          key={`mini-${chip}`}
                          type="button"
                          onClick={() => void sendQuestion(chip)}
                          className="rounded-lg border border-[#28384A] bg-[#0B1117]/75 px-2.5 py-1 text-[11px] font-semibold text-[#92A8BE] hover:border-[#00B8FF]/60 hover:text-white transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Indicador de carregamento */}
              {loading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#28384A] bg-[#0B1117] px-3.5 py-2.5 text-xs text-[#92A8BE]">
                    <span className="h-2 w-2 rounded-full bg-[#00B8FF] animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-[#00B8FF] animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-[#00B8FF] animate-bounce [animation-delay:240ms]" />
                    <span className="ml-1 font-semibold">Pingo está escrevendo...</span>
                  </div>
                </div>
              )}

              {/* Aviso de erro amigável */}
              {errorInfo && (
                <div className="rounded-2xl border border-[#FF4B4B]/50 bg-[#2D1218]/90 p-3.5 space-y-2.5 text-xs text-[#FFD5D5]">
                  <p className="font-semibold leading-relaxed">{errorInfo.message}</p>
                  {errorInfo.needsKey && (
                    <TactileButton
                      size="sm"
                      variant="primary"
                      onClick={onOpenSettings}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Configurar Chave API Groq</span>
                    </TactileButton>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rodapé Fixo: Input livre */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-[#28384A] bg-[#0B1117]/95 p-3 sm:p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  placeholder="Ex: Por que a B está certa e a C errada?"
                  aria-label="Escreva sua dúvida para o Pingo"
                  className="min-w-0 flex-1 rounded-xl border-2 border-[#28384A] bg-[#131C26] px-3.5 py-2.5 text-xs sm:text-sm text-[#E8F1F8] placeholder:text-[#5B728A] focus:border-[#00B8FF] focus:outline-none disabled:opacity-60"
                />
                <TactileButton
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={loading || !inputText.trim()}
                  aria-label="Enviar pergunta para o Pingo"
                  className="shrink-0 px-3.5"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </TactileButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
