/**
 * useAutoSave Hook
 * Manages auto-save functionality for forms and data
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useFinance } from '@/lib/finance-context';

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: () => void;
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { state, getSettings } = useFinance();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settings = getSettings();

  const enabled = options.enabled !== undefined ? options.enabled : settings.autoSaveEnabled;
  const interval = options.interval || settings.autoSaveInterval;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      if (options.onSave) {
        options.onSave();
      }
    }, interval);
  }, [enabled, interval, options]);

  // Trigger auto-save when state changes
  useEffect(() => {
    scheduleAutoSave();
  }, [state, scheduleAutoSave]);

  return {
    isAutoSaveEnabled: enabled,
    autoSaveInterval: interval,
    scheduleAutoSave,
  };
}

/**
 * Hook to show auto-save indicator
 */
export function useAutoSaveIndicator() {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaveIndicator = useCallback(() => {
    setIsSaving(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide indicator after 1 second
    timeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    showSaveIndicator,
  };
}
