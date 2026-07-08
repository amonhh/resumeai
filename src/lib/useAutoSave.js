import { useState, useRef, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'resumeai_draft';
const DEBOUNCE_MS = 2500;

export function useAutoSave(resumeData, isAuthenticated, saveToApiRef) {
  const [saveStatus, setSaveStatus] = useState('idle');
  const timerRef = useRef(null);
  const lastSavedRef = useRef(Date.now());
  const dataRef = useRef(resumeData);
  dataRef.current = resumeData;

  const saveToLocal = useCallback((data) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, savedAt: Date.now() }));
    } catch {}
  }, []);

  const debouncedSave = useCallback((data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus('saving');
    timerRef.current = setTimeout(async () => {
      try {
        if (data && data.id && !data.id.startsWith('draft_') && isAuthenticated && saveToApiRef?.current) {
          await saveToApiRef.current(data);
        }
        saveToLocal(data);
        lastSavedRef.current = Date.now();
        setSaveStatus('saved');
      } catch {
        saveToLocal(data);
        setSaveStatus('error');
      }
    }, DEBOUNCE_MS);
  }, [isAuthenticated, saveToApiRef, saveToLocal]);

  useEffect(() => {
    if (resumeData) debouncedSave(resumeData);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resumeData, debouncedSave]);

  useEffect(() => {
    const handle = () => {
      if (dataRef.current) saveToLocal(dataRef.current);
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [saveToLocal]);

  const getRelativeTime = useCallback(() => {
    const diff = Date.now() - lastSavedRef.current;
    if (diff < 5000) return 'Saved just now';
    if (diff < 60000) return `Saved ${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
    return `Saved ${Math.floor(diff / 3600000)}h ago`;
  }, []);

  return { saveStatus, getRelativeTime, lastSaved: lastSavedRef.current };
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem('resumeai_draft');
    if (raw) {
      const { data, savedAt } = JSON.parse(raw);
      if (savedAt && Date.now() - savedAt < 86400000) return data;
    }
  } catch {}
  return null;
}

export function clearDraft() {
  try { localStorage.removeItem('resumeai_draft'); } catch {}
}
