/**
 * Fil: LegalModal.tsx
 * Utvikler(e): Ramona Cretulescu
 *
 * Beskrivelse:
 * Gjenbrukbar modal-komponent for juridisk innhold som personvern og vilkår.
 * Komponenten vises som et kort over siden med dempet bakgrunn og lukkeknapp.
 */

import type { ReactNode } from "react";

type LegalModalProps = {
  title: string;
  updatedAt: string;
  buttonText: string;
  onClose: () => void;
  children: ReactNode;
};

export default function LegalModal({
  title,
  updatedAt,
  buttonText,
  onClose,
  children,
}: LegalModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#17331C] p-7 text-white shadow-2xl">
        <h2 className="mb-2 text-3xl font-semibold">{title}</h2>

        <p className="mb-6 text-sm font-medium text-white/70">
          Sist oppdatert: {updatedAt}
        </p>

        <div className="space-y-6 text-base leading-8 text-white/85">
          {children}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-emerald-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}