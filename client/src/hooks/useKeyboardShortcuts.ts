import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrl || event.ctrlKey;
        const shiftMatch = !shortcut.shift || event.shiftKey;
        const altMatch = !shortcut.alt || event.altKey;

        // Ensure we don't have extra modifiers
        const hasExtraCtrl = !shortcut.ctrl && event.ctrlKey;
        const hasExtraShift = !shortcut.shift && event.shiftKey;
        const hasExtraAlt = !shortcut.alt && event.altKey;

        if (
          keyMatch &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          !hasExtraCtrl &&
          !hasExtraShift &&
          !hasExtraAlt
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Predefined shortcuts for common actions
export const commonShortcuts = {
  addTask: { key: 'n', ctrl: true, description: 'Create new task' },
  search: { key: '/', description: 'Focus search' },
  toggleTheme: { key: 't', ctrl: true, description: 'Toggle theme' },
  showHelp: { key: '?', shift: true, description: 'Show help' },
  escape: { key: 'Escape', description: 'Close modal/cancel' },
  save: { key: 's', ctrl: true, description: 'Save changes' },
  refresh: { key: 'r', ctrl: true, description: 'Refresh page' },
};