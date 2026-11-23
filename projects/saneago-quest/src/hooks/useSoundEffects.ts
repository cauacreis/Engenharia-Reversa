import { useCallback, useEffect, useRef } from 'react';
import { useGameProgress } from './useGameProgress';

export function useSoundEffects() {
  const { progress } = useGameProgress();
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    if (!progress.soundEnabled || typeof window === 'undefined') {
      return null;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => undefined);
    }
    return ctxRef.current;
  }, [progress.soundEnabled]);

  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      durationSec: number,
      type: OscillatorType = 'sine',
      delaySec: number = 0,
      volume: number = 0.09
    ) => {
      const ctx = getContext();
      if (!ctx) return;

      const startAt = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + durationSec + 0.02);
    },
    [getContext]
  );

  const playCorrect = useCallback(() => {
    playTone(523.25, 0.11, 'triangle', 0, 0.09);
    playTone(659.25, 0.15, 'triangle', 0.08, 0.1);
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(210, 0.14, 'sawtooth', 0, 0.06);
    playTone(165, 0.2, 'sawtooth', 0.1, 0.06);
  }, [playTone]);

  const playPairMatch = useCallback(() => {
    playTone(587.33, 0.09, 'sine', 0, 0.07);
    playTone(783.99, 0.1, 'sine', 0.06, 0.07);
  }, [playTone]);

  const playComplete = useCallback(() => {
    playTone(523.25, 0.12, 'triangle', 0, 0.09);
    playTone(659.25, 0.12, 'triangle', 0.09, 0.09);
    playTone(783.99, 0.14, 'triangle', 0.18, 0.09);
    playTone(1046.5, 0.28, 'triangle', 0.28, 0.11);
  }, [playTone]);

  return {
    playCorrect,
    playWrong,
    playPairMatch,
    playComplete,
  };
}
