import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Eye, EyeOff, KeyRound, Sparkles, Trash2, XCircle } from 'lucide-react';
import { useGameProgress } from '../../hooks/useGameProgress';
import {
  clearGroqApiKey,
  getGroqApiKey,
  getSelectedGroqModel,
  hasEnvGroqKey,
  hasStoredGroqKey,
  saveGroqApiKey,
  saveSelectedGroqModel,
  testGroqConnection,
} from '../../services/groqTutorService';
import { Modal } from './Modal';
import { TactileButton } from './TactileButton';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onKeyStatusChanged?: () => void;
}

const DAILY_GOALS = [40, 60, 100, 150];

export function SettingsModal({
  open,
  onClose,
  onKeyStatusChanged,
}: SettingsModalProps) {
  const { progress, setDailyGoal } = useGameProgress();
  const [selectedModel, setSelectedModel] = useState<string>(getSelectedGroqModel());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'ok' | 'err' | 'info';
    text: string;
  } | null>(null);

  const envActive = hasEnvGroqKey();
  const storedActive = hasStoredGroqKey();

  useEffect(() => {
    if (!open) return;
    setStatusMessage(null);
    const current = getGroqApiKey();
    setApiKeyInput(storedActive && current && !envActive ? current : '');
    setSelectedModel(getSelectedGroqModel());
  }, [envActive, open, storedActive]);

  const handleSaveKey = () => {
    saveGroqApiKey(apiKeyInput);
    saveSelectedGroqModel(selectedModel);
    onKeyStatusChanged?.();
    if (apiKeyInput.trim()) {
      setStatusMessage({
        kind: 'ok',
        text: 'Configurações salvas no navegador com sucesso.',
      });
    } else {
      setStatusMessage({
        kind: 'info',
        text: 'Chave removida do navegador.',
      });
    }
  };

  const handleClearKey = () => {
    clearGroqApiKey();
    setApiKeyInput('');
    onKeyStatusChanged?.();
    setStatusMessage({
      kind: 'info',
      text: 'Chave removida deste navegador.',
    });
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim() || getGroqApiKey() || '';
    if (!keyToTest) {
      setStatusMessage({
        kind: 'err',
        text: 'Cole uma chave da Groq (gsk_...) antes de testar.',
      });
      return;
    }
    setTesting(true);
    setStatusMessage(null);
    try {
      const modelUsed = await testGroqConnection(keyToTest, selectedModel);
      if (apiKeyInput.trim()) {
        saveGroqApiKey(apiKeyInput);
        saveSelectedGroqModel(selectedModel);
        onKeyStatusChanged?.();
      }
      setStatusMessage({
        kind: 'ok',
        text: `Conexão confirmada com a Groq (${modelUsed}).`,
      });
    } catch (err) {
      setStatusMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Falha ao conectar na Groq.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Configurações" maxWidthClass="max-w-lg">
      <div className="space-y-6">
        {/* Bloco Chave API Groq */}
        <section className="rounded-2xl border-2 border-[#28384A] bg-[#0B1117]/75 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#00B8FF]" />
              <h3 className="font-display text-base font-extrabold text-[#E8F1F8]">
                Chave API Groq (Tutor & Gerador IA)
              </h3>
            </div>
            <span
              className={`rounded-lg px-2 py-0.5 text-[11px] font-display font-bold ${
                envActive || storedActive
                  ? 'bg-[#58CC02]/15 text-[#86F23B]'
                  : 'bg-[#1D2A38] text-[#92A8BE]'
              }`}
            >
              {envActive
                ? 'Ativa (.env)'
                : storedActive
                ? 'Salva no navegador'
                : 'Não configurada'}
            </span>
          </div>

          <p className="text-xs text-[#92A8BE] leading-relaxed">
            Opcional: configure sua chave gratuita da Groq para ativar o diagnóstico com IA e a criação ilimitada de questões inéditas. Sem chave, o aplicativo continua funcionando normalmente com o banco de 160 questões.
          </p>

          {envActive && (
            <p className="rounded-xl bg-[#58CC02]/10 border border-[#58CC02]/40 px-3 py-2 text-xs text-[#86F23B]">
              Detectada variável <code>VITE_GROQ_API_KEY</code> no ambiente local. Você também pode sobrescrever salvando outra chave abaixo.
            </p>
          )}

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="gsk_..."
              aria-label="Chave API Groq"
              className="w-full rounded-xl border-2 border-[#28384A] bg-[#131C26] pl-3.5 pr-10 py-2.5 font-mono text-xs text-[#E8F1F8] placeholder:text-[#5B728A] focus:border-[#00B8FF] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#92A8BE] hover:text-white"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#92A8BE]">
              Modelo Groq:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                saveSelectedGroqModel(e.target.value);
              }}
              aria-label="Modelo Groq"
              className="w-full rounded-xl border-2 border-[#28384A] bg-[#131C26] px-3 py-2 text-xs font-semibold text-[#E8F1F8] focus:border-[#00B8FF] focus:outline-none"
            >
              <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Recomendado — Raciocínio & Diagnóstico)</option>
              <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Ultra-rápido ~1000 tps)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Plano Enterprise)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Legado)</option>
            </select>
          </div>

          {statusMessage && (
            <div
              className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                statusMessage.kind === 'ok'
                  ? 'bg-[#58CC02]/15 text-[#86F23B]'
                  : statusMessage.kind === 'err'
                  ? 'bg-[#FF4B4B]/15 text-[#FF8585]'
                  : 'bg-[#1D2A38] text-[#C7D7E6]'
              }`}
            >
              {statusMessage.kind === 'ok' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : statusMessage.kind === 'err' ? (
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <TactileButton size="sm" variant="primary" onClick={handleSaveKey}>
              Salvar Chave
            </TactileButton>
            <TactileButton
              size="sm"
              variant="outline"
              disabled={testing}
              onClick={() => void handleTestKey()}
            >
              {testing ? 'Testando...' : 'Testar Conexão'}
            </TactileButton>
            {storedActive && (
              <TactileButton size="sm" variant="danger" onClick={handleClearKey}>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover</span>
              </TactileButton>
            )}
          </div>

          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B8FF] hover:underline"
          >
            <span>Obter chave gratuita no Groq Console</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </section>

        {/* Bloco Meta Diária */}
        <section className="space-y-2.5">
          <h3 className="font-display text-sm font-extrabold text-[#E8F1F8]">
            Meta Diária de XP
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map((goal) => {
              const selected = progress.dailyGoalXp === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  className={`rounded-xl border-2 border-b-[3px] py-2 font-display text-sm font-extrabold transition-all ${
                    selected
                      ? 'border-[#FFC800] bg-[#FFC800]/15 text-[#FFC800]'
                      : 'border-[#28384A] bg-[#131C26] text-[#92A8BE] hover:text-white'
                  }`}
                >
                  {goal} XP
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}
