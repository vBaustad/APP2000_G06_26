/**
 * Fil: MineTurerLeder.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Dashboard for turleder. Viser turer der innlogget bruker er
 * leder, med tilhørende tur_dato, statuser og antall påmeldinger.
 * Turlederen kan legge til nye datoer og låse/avlyse eksisterende.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Lock,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type TurDatoStatus = "planned" | "locked" | "cancelled" | "freed";
type PameldingStatus = "pending" | "binding" | "freed" | "locked";

type Pamelding = {
  id: number;
  status: PameldingStatus;
};

type TurDato = {
  id: number;
  tittel: string | null;
  start_at: string;
  end_at: string;
  status: TurDatoStatus;
  tidlig_pamelding_frist: string | null;
  rabatt_prosent: number | null;
  tur_pamelding: Pamelding[];
};

type LederTur = {
  id: number;
  tittel: string;
  status: string;
  omrade: string | null;
  antall_netter: number | null;
  created_at: string;
  tur_dato: TurDato[];
};

const DATO_STATUS_LABEL: Record<TurDatoStatus, string> = {
  planned: "Foreslått",
  locked: "Låst",
  cancelled: "Avlyst",
  freed: "Fristilt",
};

const DATO_STATUS_STYLE: Record<TurDatoStatus, string> = {
  planned: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  locked: "bg-blue-100 text-blue-900 ring-1 ring-blue-200",
  cancelled: "bg-red-100 text-red-900 ring-1 ring-red-200",
  freed: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
};

function formatDato(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type NyDatoSkjema = {
  tittel: string;
  startAt: string;
  endAt: string;
  tidligFrist: string;
  rabatt: string;
};

const TOMT_SKJEMA: NyDatoSkjema = {
  tittel: "",
  startAt: "",
  endAt: "",
  tidligFrist: "",
  rabatt: "",
};

export default function MineTurerLeder() {
  const { token } = useAuth();
  const [turer, setTurer] = useState<LederTur[]>([]);
  const [loading, setLoading] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);
  const [aapenSkjemaTurId, setAapenSkjemaTurId] = useState<number | null>(null);
  const [skjema, setSkjema] = useState<NyDatoSkjema>(TOMT_SKJEMA);
  const [skjemaBusy, setSkjemaBusy] = useState(false);
  const [skjemaFeil, setSkjemaFeil] = useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);

  async function hentTurer() {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/mine-leder`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        throw new Error("Kunne ikke hente turer.");
      }
      const data = (await res.json()) as LederTur[];
      setTurer(data);
      setFeil(null);
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    hentTurer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function aapneSkjema(turId: number) {
    setAapenSkjemaTurId(turId);
    setSkjema(TOMT_SKJEMA);
    setSkjemaFeil(null);
  }

  function lukkSkjema() {
    setAapenSkjemaTurId(null);
    setSkjema(TOMT_SKJEMA);
    setSkjemaFeil(null);
  }

  async function handleLeggTilDato(turId: number, e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!skjema.startAt || !skjema.endAt) {
      setSkjemaFeil("Startdato og sluttdato er påkrevd.");
      return;
    }

    setSkjemaBusy(true);
    setSkjemaFeil(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/${turId}/datoer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tittel: skjema.tittel.trim() || null,
            start_at: skjema.startAt,
            end_at: skjema.endAt,
            tidlig_pamelding_frist: skjema.tidligFrist || null,
            rabatt_prosent: skjema.rabatt || null,
          }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Kunne ikke legge til dato.");
      }
      lukkSkjema();
      await hentTurer();
    } catch (err) {
      setSkjemaFeil(err instanceof Error ? err.message : "Ukjent feil.");
    } finally {
      setSkjemaBusy(false);
    }
  }

  async function handleEndreStatus(
    datoId: number,
    nyStatus: "locked" | "cancelled",
  ) {
    if (!token) return;
    const bekreftelse =
      nyStatus === "locked"
        ? "Låse denne datoen? Andre datoer på samme tur vil bli fristilt."
        : "Avlyse denne datoen? Påmeldinger blir fristilt.";
    if (!window.confirm(bekreftelse)) return;

    setStatusBusyId(datoId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/datoer/${datoId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nyStatus }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Kunne ikke oppdatere status.");
      }
      await hentTurer();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Ukjent feil.");
    } finally {
      setStatusBusyId(null);
    }
  }

  const totalDatoer = useMemo(
    () => turer.reduce((sum, t) => sum + t.tur_dato.length, 0),
    [turer],
  );

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
        Du må være logget inn for å se denne siden.
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
        Laster turer...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Mine turer som leder
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {turer.length} {turer.length === 1 ? "tur" : "turer"} · {totalDatoer}{" "}
            datoer totalt
          </p>
        </div>
        <Link
          to="/opprett-tur"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12351d]"
        >
          <Plus className="h-4 w-4" />
          Opprett ny tur
        </Link>
      </header>

      {feil && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {feil}
        </div>
      )}

      {turer.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">
            Du leder ingen turer ennå.{" "}
            <Link to="/opprett-tur" className="font-semibold text-[#0f3d2e] underline">
              Opprett din første tur
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {turer.map((tur) => (
            <section
              key={tur.id}
              className="rounded-2xl bg-white p-6 shadow ring-1 ring-slate-100"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    <Link
                      to={`/turer/${tur.id}`}
                      className="hover:underline"
                    >
                      {tur.tittel}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-500">
                    {tur.omrade ?? "Uten område"}
                    {tur.antall_netter ? ` · ${tur.antall_netter} netter` : ""}
                    {" · "}
                    Opprettet {formatDato(tur.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    aapenSkjemaTurId === tur.id ? lukkSkjema() : aapneSkjema(tur.id)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f3d2e] bg-white px-3 py-1.5 text-sm font-semibold text-[#0f3d2e] hover:bg-[#eef5f1]"
                >
                  <CalendarDays className="h-4 w-4" />
                  {aapenSkjemaTurId === tur.id ? "Lukk" : "Legg til dato"}
                </button>
              </div>

              {aapenSkjemaTurId === tur.id && (
                <form
                  onSubmit={(e) => handleLeggTilDato(tur.id, e)}
                  className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Tittel (valgfri)
                    </label>
                    <input
                      type="text"
                      value={skjema.tittel}
                      onChange={(e) =>
                        setSkjema({ ...skjema, tittel: e.target.value })
                      }
                      placeholder="f.eks. Påskeuka"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={skjema.startAt}
                      onChange={(e) =>
                        setSkjema({ ...skjema, startAt: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Slutt *
                    </label>
                    <input
                      type="datetime-local"
                      value={skjema.endAt}
                      onChange={(e) =>
                        setSkjema({ ...skjema, endAt: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Tidlig påmeldings-frist (valgfri)
                    </label>
                    <input
                      type="datetime-local"
                      value={skjema.tidligFrist}
                      onChange={(e) =>
                        setSkjema({ ...skjema, tidligFrist: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Rabatt tidlig (%) (valgfri)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={skjema.rabatt}
                      onChange={(e) =>
                        setSkjema({ ...skjema, rabatt: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0f3d2e]"
                    />
                  </div>

                  {skjemaFeil && (
                    <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {skjemaFeil}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 sm:col-span-2">
                    <button
                      type="button"
                      onClick={lukkSkjema}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      disabled={skjemaBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12351d] disabled:opacity-60"
                    >
                      <Plus className="h-4 w-4" />
                      {skjemaBusy ? "Lagrer..." : "Legg til"}
                    </button>
                  </div>
                </form>
              )}

              {tur.tur_dato.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Ingen datoer lagt til ennå. Legg til minst én dato så
                  brukere kan melde seg på.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {tur.tur_dato.map((dato) => {
                    const antallPending = dato.tur_pamelding.filter(
                      (p) => p.status === "pending",
                    ).length;
                    const antallBinding = dato.tur_pamelding.filter(
                      (p) => p.status === "binding",
                    ).length;
                    const antallLocked = dato.tur_pamelding.filter(
                      (p) => p.status === "locked",
                    ).length;
                    const kanEndres = dato.status === "planned";
                    const jobber = statusBusyId === dato.id;

                    return (
                      <li
                        key={dato.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DATO_STATUS_STYLE[dato.status]}`}
                            >
                              {DATO_STATUS_LABEL[dato.status]}
                            </span>
                            {dato.tittel && (
                              <span className="text-sm font-semibold text-slate-800">
                                {dato.tittel}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            {formatDato(dato.start_at)} – {formatDato(dato.end_at)}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {antallBinding} bindende · {antallPending} interesse
                              {antallLocked > 0 ? ` · ${antallLocked} låst` : ""}
                            </span>
                            {dato.tidlig_pamelding_frist && (
                              <span>
                                Tidlig frist:{" "}
                                {formatDato(dato.tidlig_pamelding_frist)}
                                {dato.rabatt_prosent
                                  ? ` (${dato.rabatt_prosent}% rabatt)`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {kanEndres && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={jobber}
                              onClick={() => handleEndreStatus(dato.id, "locked")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3d2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#12351d] disabled:opacity-60"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Lås
                            </button>
                            <button
                              type="button"
                              disabled={jobber}
                              onClick={() => handleEndreStatus(dato.id, "cancelled")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Avlys
                            </button>
                          </div>
                        )}
                        {dato.status === "locked" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Låst — andre datoer fristilt
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
