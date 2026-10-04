import { useEffect, useRef, type PropsWithChildren } from "react";
export function Dialog({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  const reference = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = reference.current; dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={reference} className="modal" aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === reference.current) onClose(); }}>
    <header className="section-heading"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" aria-label="Close / Kapat" onClick={onClose}>×</button></header>{children}
  </dialog>;
}
