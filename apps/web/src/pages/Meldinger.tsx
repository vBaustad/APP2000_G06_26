/**
 * Fil: Meldinger.tsx
 * Utvikler(e): Aleksandra Cudakiewicz
 * Beskrivelse: Meldingsside der innloggede brukere kan se og bruke direktemeldinger
 * og gruppechatter knyttet til turer. Siden viser oversikt over chatter,
 * meldingshistorikk for valgt samtale, mulighet for å sende meldinger,
 * starte nye samtaler og håndtere bilder som deles i chatten.
 */


import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ImagePlus, MessageCircle, PenSquare, Search, Send, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type InboxChat = {
  id: number;
  type: "direct" | "group";
  title: string;
  subtitle: string;
  memberCount: number;
  latestMessage: {
    body: string;
    created_at: string;
    senderNavn: string;
  } | null;
  updatedAt: string;
};

type ChatDetail = {
  id: number;
  type: "direct" | "group";
  title: string;
  subtitle: string;
  medlemmer: Array<{
    id: number;
    navn: string;
    epost: string;
  }>;
  meldinger: Array<{
    id: number;
    body: string;
    created_at: string;
    sender: {
      id: number;
      navn: string;
    };
    bilder?: Array<{
      id: number;
      imageUrl: string | null;
      isVisibleToCurrentUser: boolean;
      requiresApproval: boolean;
      approvedCount: number;
    }>;
  }>;
};

type SearchUser = {
  id: number;
  navn: string;
  epost: string;
};

function formatTidspunkt(iso: string) {
  try {
    return new Date(iso).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatKortTid(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Meldinger() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inbox, setInbox] = useState<InboxChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendBusy, setSendBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [approvingImageId, setApprovingImageId] = useState<number | null>(null);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [createBusyId, setCreateBusyId] = useState<number | null>(null);

  const requestedChatId = useMemo(() => {
    const raw = searchParams.get("chat");
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      setInbox([]);
      setActiveChat(null);
      setInboxLoading(false);
      return;
    }

    let active = true;

    async function loadInbox(silent = false) {
      if (!silent) {
        setInboxLoading(true);
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json().catch(() => null)) as
          | (InboxChat[] & { error?: string })
          | null;

        if (!active) return;

        if (!res.ok) {
          setPageError((data as { error?: string } | null)?.error || "Kunne ikke hente meldinger.");
          return;
        }

        const chats = Array.isArray(data) ? data : [];
        setInbox(chats);
        setPageError(null);
      } catch (error) {
        console.error("Feil ved henting av meldinger:", error);
        if (active) {
          setPageError("Kunne ikke hente meldinger.");
        }
      } finally {
        if (active && !silent) {
          setInboxLoading(false);
        }
      }
    }

    void loadInbox();

    const interval = window.setInterval(() => {
      void loadInbox(true);
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (inbox.length === 0) {
      setSelectedChatId(null);
      setActiveChat(null);
      return;
    }

    if (requestedChatId && inbox.some((chat) => chat.id === requestedChatId)) {
      setSelectedChatId(requestedChatId);
      return;
    }

    setSelectedChatId((current) => {
      if (current && inbox.some((chat) => chat.id === current)) {
        return current;
      }
      return inbox[0].id;
    });
  }, [inbox, requestedChatId]);

  useEffect(() => {
    if (!token || !selectedChatId) {
      setActiveChat(null);
      return;
    }

    let active = true;

    async function loadChat(silent = false) {
      if (!silent) {
        setChatLoading(true);
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chats/${selectedChatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = (await res.json().catch(() => null)) as
          | (ChatDetail & { error?: string })
          | null;

        if (!active) return;

        if (!res.ok) {
          setPageError(data?.error || "Kunne ikke hente chatten.");
          setActiveChat(null);
          return;
        }

        setActiveChat(data as ChatDetail);
        setPageError(null);
      } catch (error) {
        console.error("Feil ved henting av chat:", error);
        if (active) {
          setPageError("Kunne ikke hente chatten.");
          setActiveChat(null);
        }
      } finally {
        if (active && !silent) {
          setChatLoading(false);
        }
      }
    }

    void loadChat();

    const interval = window.setInterval(() => {
      void loadChat(true);
    }, 8000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedChatId, token]);

  useEffect(() => {
    if (!newChatOpen || !token) return;

    const q = searchText.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    let active = true;
    setSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chats/users/search?q=${encodeURIComponent(q)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = (await res.json().catch(() => null)) as
          | (SearchUser[] & { error?: string })
          | null;

        if (!active) return;

        if (!res.ok) {
          setSearchError((data as { error?: string } | null)?.error || "Kunne ikke søke etter brukere.");
          setSearchResults([]);
          return;
        }

        setSearchResults(Array.isArray(data) ? data : []);
        setSearchError(null);
      } catch (error) {
        console.error("Feil ved brukersøk:", error);
        if (active) {
          setSearchError("Kunne ikke søke etter brukere.");
          setSearchResults([]);
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [newChatOpen, searchText, token]);

  function selectChat(chatId: number) {
    setSelectedChatId(chatId);
    setSearchParams({ chat: String(chatId) });
  }

  async function handleSendMessage() {
    if (!token || !selectedChatId) return;

    const tekst = messageText.trim();
    if (!tekst) {
      setPageError("Skriv en melding før du sender.");
      return;
    }

    setSendBusy(true);
    setPageError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${selectedChatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: tekst }),
        },
      );

      const data = (await res.json().catch(() => null)) as
        | ({
            id: number;
            body: string;
            created_at: string;
            sender: { id: number; navn: string };
            error?: string;
          })
        | null;

      if (!res.ok) {
        setPageError(data?.error || "Kunne ikke sende meldingen.");
        return;
      }

      setActiveChat((current) =>
        current
          ? {
              ...current,
              meldinger: [...current.meldinger, data!],
            }
          : current,
      );
      setInbox((current) =>
        current
          .map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  latestMessage: {
                    body: data!.body,
                    created_at: data!.created_at,
                    senderNavn: data!.sender.navn,
                  },
                  updatedAt: data!.created_at,
                }
              : chat,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
      setMessageText("");
    } catch (error) {
      console.error("Feil ved sending av melding:", error);
      setPageError("Kunne ikke sende meldingen.");
    } finally {
      setSendBusy(false);
    }
  }

  async function handleUploadImage(file: File) {
    if (!token || !selectedChatId) return;

    const formData = new FormData();
    formData.append("bilde", file);
    if (messageText.trim()) {
      formData.append("body", messageText.trim());
    }

    setImageBusy(true);
    setPageError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${selectedChatId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = (await res.json().catch(() => null)) as
        | (ChatDetail["meldinger"][number] & { error?: string })
        | null;

      if (!res.ok || !data) {
        setPageError(data?.error || "Kunne ikke laste opp bildet.");
        return;
      }

      setActiveChat((current) =>
        current
          ? {
              ...current,
              meldinger: [...current.meldinger, data],
            }
          : current,
      );
      setInbox((current) =>
        current
          .map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  latestMessage: {
                    body: data.body || "Sendte et bilde",
                    created_at: data.created_at,
                    senderNavn: data.sender.navn,
                  },
                  updatedAt: data.created_at,
                }
              : chat,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
      setMessageText("");
    } catch (error) {
      console.error("Feil ved bildeopplasting:", error);
      setPageError("Kunne ikke laste opp bildet.");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleApproveImage(imageId: number) {
    if (!token || !selectedChatId) return;

    setApprovingImageId(imageId);
    setPageError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${selectedChatId}/images/${imageId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await res.json().catch(() => null)) as
        | {
            imageId: number;
            approvedCount: number;
            isVisibleToCurrentUser: boolean;
            imageUrl: string;
            error?: string;
          }
        | null;

      if (!res.ok || !data) {
        setPageError(data?.error || "Kunne ikke godkjenne bildet.");
        return;
      }

      setActiveChat((current) =>
        current
          ? {
              ...current,
              meldinger: current.meldinger.map((melding) => ({
                ...melding,
                bilder: melding.bilder.map((bilde) =>
                  bilde.id === imageId
                    ? {
                        ...bilde,
                        imageUrl: data.imageUrl,
                        isVisibleToCurrentUser: true,
                        requiresApproval: false,
                        approvedCount: data.approvedCount,
                      }
                    : bilde,
                ),
              })),
            }
          : current,
      );
    } catch (error) {
      console.error("Feil ved godkjenning av bilde:", error);
      setPageError("Kunne ikke godkjenne bildet.");
    } finally {
      setApprovingImageId(null);
    }
  }

  async function handleCreateDirectChat(brukerId: number) {
    if (!token) return;

    setCreateBusyId(brukerId);
    setSearchError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientUserId: brukerId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { chatId?: number; error?: string }
        | null;

      if (!res.ok || !data?.chatId) {
        setSearchError(data?.error || "Kunne ikke opprette chat.");
        return;
      }

      setNewChatOpen(false);
      setSearchText("");
      setSearchResults([]);
      setSearchError(null);
      setSelectedChatId(data.chatId);
      setSearchParams({ chat: String(data.chatId) });

      const inboxRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inboxData = (await inboxRes.json().catch(() => null)) as InboxChat[] | null;
      if (inboxRes.ok && Array.isArray(inboxData)) {
        setInbox(inboxData);
      }
    } catch (error) {
      console.error("Feil ved oppretting av chat:", error);
      setSearchError("Kunne ikke opprette chat.");
    } finally {
      setCreateBusyId(null);
    }
  }

  if (!token) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Meldinger</h1>
          <p className="mt-2 text-slate-600">
            Logg inn for å se gruppechatter fra turer og starte direktemeldinger med andre brukere.
          </p>
          <Link
            to="/logg-inn"
            className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Logg inn
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[78vh] bg-slate-50 px-4 py-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-700" />
              <h1 className="text-2xl font-semibold text-slate-900">Meldinger</h1>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Her finner du direktechatter og gruppechatter du er med i.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewChatOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <PenSquare className="h-4 w-4" />
            Ny chat
          </button>
        </div>

        {pageError && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
            {pageError}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Innboks</div>
              <div className="mt-1 text-xs text-slate-500">
                {inbox.length} {inbox.length === 1 ? "chat" : "chatter"}
              </div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto">
              {inboxLoading ? (
                <div className="p-5 text-sm text-slate-500">Laster meldinger...</div>
              ) : inbox.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  Du har ingen chatter ennå. Start en ny samtale eller vent til en gruppetur blir låst.
                </div>
              ) : (
                inbox.map((chat) => {
                  const aktiv = chat.id === selectedChatId;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => selectChat(chat.id)}
                      className={`w-full border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                        aktiv ? "bg-emerald-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {chat.title}
                          </div>
                          <div className="mt-1 truncate text-xs text-slate-500">
                            {chat.subtitle}
                          </div>
                        </div>
                        <div className="shrink-0 text-[11px] text-slate-400">
                          {formatKortTid(chat.updatedAt)}
                        </div>
                      </div>

                      <div className="mt-3 truncate text-sm text-slate-600">
                        {chat.latestMessage
                          ? `${chat.latestMessage.senderNavn}: ${chat.latestMessage.body}`
                          : "Ingen meldinger ennå"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {!selectedChatId ? (
              <div className="flex min-h-[68vh] items-center justify-center p-8 text-center">
                <div>
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <div className="mt-3 text-lg font-semibold text-slate-900">
                    Ingen chat valgt
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Velg en samtale i innboksen, eller start en ny chat.
                  </p>
                </div>
              </div>
            ) : chatLoading && !activeChat ? (
              <div className="p-6 text-sm text-slate-500">Laster samtale...</div>
            ) : activeChat ? (
              <div className="flex min-h-[68vh] flex-col">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-semibold text-slate-900">
                        {activeChat.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {activeChat.subtitle}
                      </div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {activeChat.medlemmer.length} deltakere
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeChat.medlemmer.map((medlem) => (
                      <span
                        key={medlem.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {medlem.navn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                  {activeChat.meldinger.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                      Ingen meldinger ennå. Send den første meldingen for å starte samtalen.
                    </div>
                  ) : (
                    activeChat.meldinger.map((melding) => {
                      const erMin = melding.sender.id === user?.id;
                      return (
                        <div
                          key={melding.id}
                          className={`flex ${erMin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                              erMin
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-800 ring-1 ring-slate-200"
                            }`}
                          >
                            <div
                              className={`text-xs font-semibold ${
                                erMin ? "text-white/80" : "text-slate-500"
                              }`}
                            >
                              {melding.sender.navn}
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                              {melding.body}
                            </p>
                            {Array.isArray(melding.bilder) && melding.bilder.length > 0 && (
                              <div className="mt-3 space-y-3">
                                {melding.bilder.map((bilde) =>
                                  bilde.isVisibleToCurrentUser && bilde.imageUrl ? (
                                    <img
                                      key={bilde.id}
                                      src={bilde.imageUrl}
                                      alt="Opplastet i chat"
                                      className="max-h-[320px] rounded-2xl object-cover"
                                    />
                                  ) : (
                                    <div
                                      key={bilde.id}
                                      className={`rounded-2xl border p-4 text-sm ${
                                        erMin
                                          ? "border-white/20 bg-white/10 text-white"
                                          : "border-slate-200 bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <div className="font-semibold">
                                        Bildet er skjult til du godkjenner det
                                      </div>
                                      <div
                                        className={`mt-1 text-xs ${
                                          erMin ? "text-white/80" : "text-slate-500"
                                        }`}
                                      >
                                        {bilde.approvedCount} har allerede godkjent
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveImage(bilde.id)}
                                        disabled={approvingImageId === bilde.id}
                                        className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                                          erMin
                                            ? "bg-white text-emerald-700"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        {approvingImageId === bilde.id
                                          ? "Godkjenner..."
                                          : "Godkjenn og vis bilde"}
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                            <div
                              className={`mt-2 text-[11px] ${
                                erMin ? "text-white/75" : "text-slate-400"
                              }`}
                            >
                              {formatTidspunkt(melding.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Skriv en melding..."
                      maxLength={1000}
                      className="min-h-[110px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <ImagePlus className="h-4 w-4" />
                        {imageBusy ? "Laster opp..." : "Bilde"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={imageBusy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleUploadImage(file);
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={sendBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {sendBusy ? "Sender..." : "Send"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-right text-xs text-slate-400">
                    {messageText.length}/1000
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">Kunne ikke laste samtalen.</div>
            )}
          </section>
        </div>
      </section>

      {newChatOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setNewChatOpen(false);
            setSearchText("");
            setSearchResults([]);
            setSearchError(null);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Start ny chat</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Søk etter en bruker og opprett en direktemelding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewChatOpen(false);
                  setSearchText("");
                  setSearchResults([]);
                  setSearchError(null);
                }}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Søk på navn eller e-post..."
                  className="w-full border-none bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {searchError && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
                {searchError}
              </div>
            )}

            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto">
              {searchText.trim().length < 2 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Skriv minst to tegn for å søke etter brukere.
                </div>
              ) : searchLoading ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                  Søker...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                  Ingen brukere matchet søket ditt.
                </div>
              ) : (
                searchResults.map((resultat) => (
                  <div
                    key={resultat.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">{resultat.navn}</div>
                      <div className="mt-1 truncate text-sm text-slate-500">{resultat.epost}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCreateDirectChat(resultat.id)}
                      disabled={createBusyId === resultat.id}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {createBusyId === resultat.id ? "Oppretter..." : "Start chat"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
