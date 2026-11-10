import { useEffect, useRef } from 'react';

const dialogs: HTMLDivElement[] = [];
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
let releaseScroll: (() => void) | undefined;

function lockPageScroll() {
  const { body, documentElement } = document;
  const bodyOverflow = body.style.overflow;
  const rootOverflow = documentElement.style.overflow;
  const hadModalClass = body.classList.contains('modal-open');
  body.classList.add('modal-open');
  body.style.overflow = 'hidden';
  documentElement.style.overflow = 'hidden';
  return () => {
    body.classList.toggle('modal-open', hadModalClass);
    body.style.overflow = bodyOverflow;
    documentElement.style.overflow = rootOverflow;
  };
}

function tabStops(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element =>
    element.tabIndex >= 0 && element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible');
}

/**
 * Custom React hook for WCAG 2.1 accessible dialogs:
 * - Traps Tab navigation inside dialog container
 * - Closes modal cleanly on 'Escape' keypress
 * - Focuses first interactive element on open
 * - Restores focus to previous active element on close/unmount
 */
export function useAccessibleDialog(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const trigger = document.activeElement;
    releaseScroll ??= lockPageScroll();
    dialogs.push(dialog);
    if (!dialog.hasAttribute('tabindex')) dialog.tabIndex = -1;
    const isTop = () => dialogs.at(-1) === dialog;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = tabStops(dialog);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const outside = !(active instanceof HTMLElement) || !focusable.includes(active);

        if (e.shiftKey && (outside || active === first)) {
          e.preventDefault();
          (last ?? dialog).focus();
        } else if (!e.shiftKey && (outside || active === last)) {
          e.preventDefault();
          (first ?? dialog).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    const initialFocusFrame = requestAnimationFrame(() => {
      if (!isTop()) return;
      const stops = tabStops(dialog);
      (stops.find(element => element.hasAttribute('data-dialog-initial-focus')) ?? stops[0] ?? dialog).focus({ preventScroll: true });
    });

    return () => {
      const wasTop = isTop();
      dialogs.splice(dialogs.indexOf(dialog), 1);
      window.removeEventListener('keydown', handleKeyDown, true);
      cancelAnimationFrame(initialFocusFrame);
      if (!dialogs.length) { releaseScroll?.(); releaseScroll = undefined; }
      const next = dialogs.at(-1);
      if (wasTop && trigger instanceof HTMLElement && trigger.isConnected && (!next || next.contains(trigger))) {
        trigger.focus({ preventScroll: true });
      } else if (wasTop && next) {
        (tabStops(next)[0] ?? next).focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return dialogRef;
}
