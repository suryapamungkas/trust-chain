"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Send, ArrowLeft, X, User, Paperclip, FileText, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: number;
  sender_id: number;
  message: string;
  message_type: "text" | "image" | "file" | "system";
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatRoom {
  id: number;
  partner_id: number;
  partner_name: string;
  partner_role: string;
  partner_avatar?: string;
  product_name?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();

  // If user is not logged in, or is on main website / login / register pages, DO NOT show chat widget
  if (!user || pathname === "/" || pathname === "/login" || pathname === "/register" || (user?.role as string) === "guest") {
    return null;
  }

  return <ChatWidgetInner user={user} />;
}

function ChatWidgetInner({ user }: { user: Record<string, unknown> | null }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showSellerPicker, setShowSellerPicker] = useState(false);
  const [verifiedSellers, setVerifiedSellers] = useState<Record<string, unknown>[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      if (isOpen) {
        if (typeof activeRoomId === "number") {
          fetchMessages(activeRoomId, true);
        } else if (activeRoomId === null && !showSellerPicker) {
          fetchRooms(true);
        }
      } else {
        checkUnread();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, isOpen, activeRoomId, showSellerPicker]);

  const handleStartChatWithPartner = async (partnerId: number) => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`/api/chat?createRoom=true&partnerId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.room && data.room.id) {
          setShowSellerPicker(false);
          await fetchRooms(true);
          handleOpenRoom(data.room.id);
        }
      }
    } catch {
      toast.error("Gagal membuka percakapan.");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkUnread = async () => {
    try {
      const res = await fetch("/api/chat?unread=true");
      if (res.ok) {
        const data = await res.json();
        setTotalUnread(data.unreadCount || 0);
      }
    } catch {}
  };

  const fetchRooms = async (silent = false) => {
    if (!silent) setLoadingRooms(true);
    try {
      const res = await fetch("/api/chat?list=true");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
        const unread = (data.rooms || []).reduce((acc: number, r: ChatRoom) => acc + (r.unread_count || 0), 0);
        setTotalUnread(unread);
      }
    } catch {}
    if (!silent) setLoadingRooms(false);
  };

  const fetchMessages = async (roomId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
    if (!silent) setLoadingMessages(false);
  };

  const handleOpenRoom = (roomId: number) => {
    setActiveRoomId(roomId);
    fetchMessages(roomId);
  };

  const handleSend = async (customMsg?: string, customType?: "text" | "image" | "file", customUrl?: string) => {
    const textToSend = customMsg || inputMsg;
    if (!textToSend.trim() || sending || typeof activeRoomId !== "number") return;

    if (!customMsg) setInputMsg("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: activeRoomId,
          message: textToSend,
          message_type: customType || "text",
          attachment_url: customUrl || null
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchMessages(activeRoomId, true);
        fetchRooms(true);
      } else {
        toast.error(data.error || "Gagal mengirim pesan.");
      }
    } catch {
      toast.error("Gagal mengirim pesan.");
    }
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || typeof activeRoomId !== "number") return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengunggah berkas...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const fileUrl = data.url;
        const isImg = file.type.startsWith("image/");
        toast.success("Berkas terunggah", { id: toastId });
        await handleSend(file.name, isImg ? "image" : "file", fileUrl);
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mengunggah berkas", { id: toastId });
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Expose global open method for "💬 Chat Penjual/Pembeli" buttons
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { openTrustChainChat?: (partnerId: number, productId?: number) => Promise<void> }).openTrustChainChat = async (partnerId: number, productId?: number) => {
        setIsOpen(true);
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to_user_id: partnerId, product_id: productId, message: "Halo, saya tertarik mengenai produk ini." }),
          });
          const data = await res.json();
          if (res.ok && data.roomId) {
            handleOpenRoom(data.roomId);
          } else {
            toast.error(data.error || "Gagal memulai obrolan.");
          }
        } catch {
          toast.error("Gagal membuka obrolan.");
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePartner = typeof activeRoomId === "number"
    ? rooms.find((r) => r.id === activeRoomId)
    : null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        style={{ display: "none" }}
      />

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "var(--text-primary)",
            color: "var(--bg-primary)",
            border: "none",
            boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          title={t("chat.title")}
        >
          <MessageCircle size={28} />
          {totalUnread > 0 && (
            <span
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                background: "#ef4444",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 12,
                border: "2px solid var(--bg-primary)",
                boxShadow: "0 2px 6px rgba(239,68,68,0.4)"
              }}
            >
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel Window */}
      {isOpen && (
        <div
          style={{
            width: 390,
            height: 560,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: 20,
            boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(24px)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Professional Header */}
          <div
            style={{
              padding: "16px 18px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {(activeRoomId !== null || showSellerPicker) && (
                <button
                  onClick={() => { setActiveRoomId(null); setShowSellerPicker(false); }}
                  style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                  title="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {showSellerPicker ? "🏪" : (activePartner ? activePartner.partner_name.charAt(0).toUpperCase() : <MessageCircle size={18} />)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    {showSellerPicker ? "Pilih Penjual Terverifikasi" : (activePartner ? activePartner.partner_name : t("chat.title"))}
                  </div>
                  <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 5, fontWeight: 600, marginTop: 1 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.8)" }} />
                    {activePartner?.partner_id === 1 ? "Official TrustChain Support" : t("chat.online")}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
              title="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column" }}>
            {showSellerPicker ? (
              /* Seller Picker View */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Daftar UMKM Terverifikasi:</div>
                {loadingSellers && <div style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--text-muted)" }}>{t("common.loading")}</div>}
                {!loadingSellers && verifiedSellers.length === 0 && (
                  <div style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--text-muted)" }}>Belum ada penjual terverifikasi.</div>
                )}
                {!loadingSellers && verifiedSellers.map((s) => (
                  <div
                    key={s.user_id}
                    onClick={() => handleStartChatWithPartner(s.user_id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = "var(--border-color)")}
                    onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                      {s.business_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                        {s.business_name} <span style={{ fontSize: 10, background: "#10b981", color: "#fff", padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>✓ Verified</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{s.category || "Jamu / Herbal"} • {s.city || "Indonesia"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeRoomId === null ? (
              /* Chat List View */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* UMKM Shortcut to Admin */}
                {user.role === "umkm" && (
                  <div
                    onClick={() => handleStartChatWithPartner(1)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>💬 Chat dengan Admin Support</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Dukungan Teknis & Verifikasi UMKM</div>
                    </div>
                  </div>
                )}

                {/* Buyer Shortcut to Admin */}
                {user.role === "buyer" && (
                  <div
                    onClick={() => handleStartChatWithPartner(1)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>💬 Chat dengan Admin TrustChain</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Bantuan Investasi & Pertanyaan Umum</div>
                    </div>
                  </div>
                )}

                {/* Buyer Shortcut to Pick Verified Sellers */}
                {user.role === "buyer" && (
                  <div
                    onClick={async () => {
                      setShowSellerPicker(true);
                      setLoadingSellers(true);
                      try {
                        const res = await fetch("/api/umkm?verification=verified");
                        const d = await res.json();
                        setVerifiedSellers(d.data || []);
                      } catch {}
                      setLoadingSellers(false);
                    }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessageCircle size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>🏪 Pilih & Chat Penjual Terverifikasi</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Hubungi UMKM terdaftar on-chain</div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Percakapan Anda</div>

                {loadingRooms && <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>{t("common.loading")}</div>}

                {!loadingRooms && rooms.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                    {t("chat.no_conversations")}
                  </div>
                )}

                {!loadingRooms && rooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenRoom(r.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = "var(--border-color)")}
                    onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                      {r.partner_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{r.partner_name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(r.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 3 }}>
                        {r.last_message || "📎 Berkas/Foto terlampir"}
                      </div>
                    </div>
                    {r.unread_count > 0 && (
                      <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 12 }}>
                        {r.unread_count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Room View */
              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {loadingMessages && <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: 20 }}>{t("common.loading")}</div>}

                {messages.map((m) => {
                  const isMe = m.sender_id === user?.id;
                  const isImg = m.message_type === "image" || (m.attachment_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(m.attachment_url));
                  const isFile = m.message_type === "file" || (!isImg && m.attachment_url);

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "82%",
                        background: isMe
                          ? "var(--text-primary)"
                          : "var(--bg-secondary)",
                        color: isMe ? "var(--bg-primary)" : "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        padding: "11px 15px",
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        fontSize: 13,
                        lineHeight: 1.45,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      {!isMe && m.sender_id === 1 && (
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                          <span>🛡️</span> Admin TrustChain Support
                        </div>
                      )}

                      {/* Attachment Preview if Image */}
                      {isImg && m.attachment_url && (
                        <div style={{ marginBottom: m.message ? 8 : 0 }}>
                          <a href={m.attachment_url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.attachment_url}
                              alt="Lampiran"
                              loading="lazy"
                              decoding="async"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 220,
                                borderRadius: 10,
                                objectFit: "cover",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "block"
                              }}
                            />
                          </a>
                        </div>
                      )}

                      {/* Attachment Preview if File/Doc */}
                      {isFile && m.attachment_url && !isImg && (
                        <div style={{ marginBottom: m.message ? 8 : 0 }}>
                          <a
                            href={m.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              background: isMe ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.06)",
                              borderRadius: 10,
                              textDecoration: "none",
                              color: "inherit",
                              border: "1px solid rgba(255,255,255,0.15)",
                            }}
                          >
                            <FileText size={20} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: "hidden" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {m.message || "Dokumen Terlampir"}
                              </div>
                              <div style={{ fontSize: 10, opacity: 0.8 }}>Klik untuk unduh/baca</div>
                            </div>
                            <Download size={16} style={{ flexShrink: 0 }} />
                          </a>
                        </div>
                      )}

                      {/* Text Message */}
                      {m.message && (!isFile || m.message_type === "text") && (
                        <div style={{ whiteSpace: "pre-line" }}>{m.message}</div>
                      )}

                      <div style={{ fontSize: 10, opacity: 0.6, textAlign: "right", marginTop: 4 }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Professional Footer Input Area (Only inside a Room) */}
          {activeRoomId !== null && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Attachment Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  cursor: uploading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                title="Unggah Foto atau Dokumen (Maks. 10MB)"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
              </button>

              <input
                type="text"
                placeholder={uploading ? "Mengunggah berkas..." : t("chat.type_message")}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={uploading || sending}
                style={{
                  flex: 1,
                  padding: "9px 15px",
                  borderRadius: 20,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputMsg.trim() || sending || uploading}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  border: "none",
                  cursor: inputMsg.trim() && !sending && !uploading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: inputMsg.trim() && !sending && !uploading ? 1 : 0.4,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
