/**
 * Fil: ResetTestdataSection.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse:
 * Liten seksjon på forsiden som lar sensor tilbakestille alle testdata
 * til seedet utgangspunkt. Krever bekreftelse i modal før kall, og viser
 * statusmelding etter kall.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, AlertTriangle, CheckCircle2, X } from "lucide-react";

export default function ResetTestdataSection() {
  const { t } = useTranslation("forside");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setConfirmOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [confirmOpen, busy]);

  async function handleReset() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reset-testdata`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setResult({ ok: false, text: data?.error || t("reset.errorGeneric") });
        return;
      }
      setResult({ ok: true, text: data.message || t("reset.success") });
      setConfirmOpen(false);
    } catch {
      setResult({ ok: false, text: t("reset.errorNetwork") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-4">
      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {t("reset.heading")}
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                {t("reset.description")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              setConfirmOpen(true);
            }}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset.button")}
          </button>
        </div>

        {result && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
            )}
            <span>{result.text}</span>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !busy && setConfirmOpen(false)}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {t("reset.confirmTitle")}
              </h3>
              <button
                type="button"
                onClick={() => !busy && setConfirmOpen(false)}
                aria-label={t("reset.cancel")}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">{t("reset.confirmBody")}</p>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>{t("reset.bullet1")}</li>
              <li>{t("reset.bullet2")}</li>
              <li>{t("reset.bullet3")}</li>
            </ul>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {t("reset.cancel")}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                {busy ? t("reset.busy") : t("reset.confirmButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
