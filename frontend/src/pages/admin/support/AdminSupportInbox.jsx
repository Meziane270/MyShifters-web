// src/pages/admin/support/AdminSupportInbox.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import StatusPill from "../components/StatusPill";
import {
    Search,
    RefreshCw,
    MessageSquareText,
    Send,
    X,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Building2,
    User,
    Filter,
    Inbox
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSupportInbox() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [threads, setThreads] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [openThreadId, setOpenThreadId] = useState(null);
    const [threadMessages, setThreadMessages] = useState([]);
    const [threadMeta, setThreadMeta] = useState(null);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);

    const fetchThreads = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.q = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const res = await axios.get(`${API}/admin/support/threads`, {
                headers: getAuthHeader(),
                params
            });
            setThreads(res.data || []);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Impossible de charger les conversations");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, searchQuery, statusFilter]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    const openThread = async (threadId) => {
        setOpenThreadId(threadId);
        setThreadMeta(threads.find((t) => t.id === threadId) || null);
        setThreadMessages([]);

        try {
            const res = await axios.get(`${API}/support/threads/${threadId}`, {
                headers: getAuthHeader()
            });
            setThreadMessages(res.data || []);

            // Mark as read by admin
            await axios.put(
                `${API}/admin/support/threads/${threadId}`,
                { mark_admin_read: true },
                { headers: getAuthHeader() }
            );

            // Refresh list to update unread counters
            fetchThreads();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Impossible d'ouvrir la conversation");
        }
    };

    const sendReply = async () => {
        if (!openThreadId || !reply.trim()) return;

        setSending(true);
        try {
            await axios.post(
                `${API}/support/threads/${openThreadId}/messages`,
                { body: reply.trim() },
                { headers: getAuthHeader() }
            );
            setReply("");

            // Refresh messages
            const res = await axios.get(`${API}/support/threads/${openThreadId}`, {
                headers: getAuthHeader()
            });
            setThreadMessages(res.data || []);

            // Refresh threads list
            fetchThreads();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de l'envoi");
        } finally {
            setSending(false);
        }
    };

    const updateThreadStatus = async (newStatus) => {
        if (!openThreadId) return;

        try {
            await axios.put(
                `${API}/admin/support/threads/${openThreadId}`,
                { status: newStatus },
                { headers: getAuthHeader() }
            );
            toast.success(`Conversation ${newStatus === 'closed' ? 'fermée' : 'marquée en attente'}`);

            // Update local thread meta
            setThreadMeta({ ...threadMeta, status: newStatus });

            // Refresh threads list
            fetchThreads();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Impossible de mettre à jour le statut");
        }
    };

    const closeThread = () => {
        setOpenThreadId(null);
        setThreadMeta(null);
        setThreadMessages([]);
        setReply("");
    };

    const filteredCountLabel = useMemo(() => {
        const count = threads.length;
        return `${count} conversation${count > 1 ? 's' : ''}`;
    }, [threads.length]);

    const unreadCount = useMemo(() => {
        return threads.filter(t => t.unread_by_admin > 0).length;
    }, [threads]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `Il y a ${diffMins} min`;
        } else if (diffHours < 24) {
            return `Il y a ${diffHours} h`;
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} j`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Support Inbox
                    </h1>
                    <p className="text-foreground/70 flex items-center gap-2">
                        <Inbox className="w-4 h-4" />
                        {filteredCountLabel}
                        {unreadCount > 0 && (
                            <Badge className="bg-brand/15 text-brand border-0 ml-2">
                                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={fetchThreads}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-[420px_1fr] gap-6">
                {/* LEFT: Threads list */}
                <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    {/* Search and filters */}
                    <div className="p-4 border-b border-border space-y-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher (objet / hôtel)"
                                    className="pl-9 bg-background border-border"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`border-border shrink-0 ${showFilters ? 'bg-brand/10 text-brand' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="pt-2">
                                <label className="text-xs text-foreground/60 mb-2 block">
                                    Filtrer par statut
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {["", "open", "pending", "closed"].map((status) => (
                                        <Button
                                            key={status || "all"}
                                            size="sm"
                                            variant={statusFilter === status ? "default" : "outline"}
                                            className={
                                                statusFilter === status
                                                    ? "bg-brand text-primary-foreground"
                                                    : "border-border"
                                            }
                                            onClick={() => setStatusFilter(status)}
                                        >
                                            {status || "Tous"}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/60">{filteredCountLabel}</span>
                            {(searchQuery || statusFilter) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-1 text-foreground/50 hover:text-foreground"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("");
                                    }}
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Effacer
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Threads list - scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 flex flex-col items-center justify-center text-foreground/70">
                                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-sm">Chargement...</p>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <MessageSquareText className="w-12 h-12 text-foreground/20 mb-3" />
                                <p className="text-foreground/70 font-medium">
                                    Aucune conversation
                                </p>
                                <p className="text-sm text-foreground/50 mt-1">
                                    {searchQuery || statusFilter
                                        ? "Essayez de modifier vos filtres"
                                        : "Les messages des hôtels apparaîtront ici"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {threads.map((thread) => {
                                    const isActive = thread.id === openThreadId;
                                    const hasUnread = thread.unread_by_admin > 0;

                                    return (
                                        <button
                                            key={thread.id}
                                            onClick={() => openThread(thread.id)}
                                            className={`w-full text-left p-4 hover:bg-foreground/5 transition-all ${
                                                isActive ? 'bg-brand/5 border-l-2 border-brand' : ''
                                            } ${hasUnread ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                    thread.status === 'open'
                                                        ? 'bg-emerald-500/10'
                                                        : thread.status === 'pending'
                                                            ? 'bg-orange-500/10'
                                                            : 'bg-zinc-500/10'
                                                }`}>
                                                    <Building2 className={`w-4 h-4 ${
                                                        thread.status === 'open'
                                                            ? 'text-emerald-600'
                                                            : thread.status === 'pending'
                                                                ? 'text-orange-600'
                                                                : 'text-zinc-600'
                                                    }`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className={`font-medium truncate ${
                                                            hasUnread ? 'text-foreground font-semibold' : 'text-foreground/90'
                                                        }`}>
                                                            {thread.subject}
                                                        </h3>
                                                        <span className="text-xs text-foreground/50 whitespace-nowrap">
                                                            {formatDate(thread.last_message_at || thread.updated_at)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-foreground/70 truncate">
                                                            {thread.hotel_name || thread.hotel_id}
                                                        </span>
                                                        <span className="text-foreground/30">•</span>
                                                        <span className="text-xs text-foreground/50 truncate">
                                                            {thread.last_message_preview || "Aucun message"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <StatusPill
                                                            status={thread.status}
                                                            context="support"
                                                            unread={thread.unread_by_admin}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Active thread */}
                <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    {!openThreadId ? (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                                <MessageSquareText className="w-10 h-10 text-foreground/30" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Aucune conversation sélectionnée
                            </h3>
                            <p className="text-foreground/70 max-w-sm">
                                Sélectionnez une conversation dans la liste pour afficher les messages
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Thread header */}
                            <div className="p-4 border-b border-border shrink-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-semibold text-foreground truncate">
                                                {threadMeta?.subject || "Conversation"}
                                            </h2>
                                            <StatusPill status={threadMeta?.status} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building2 className="w-4 h-4 text-foreground/50" />
                                            <span className="text-sm text-foreground/70 truncate">
                                                {threadMeta?.hotel_name || threadMeta?.hotel_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {threadMeta?.status !== 'closed' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                                                    onClick={() => updateThreadStatus('pending')}
                                                >
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    Pending
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                                    onClick={() => updateThreadStatus('closed')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                    Fermer
                                                </Button>
                                            </>
                                        )}
                                        {threadMeta?.status === 'closed' && (
                                            <Button
                                                size="sm"
                                                className="bg-brand hover:bg-brand-light text-primary-foreground"
                                                onClick={() => updateThreadStatus('open')}
                                            >
                                                <Clock className="w-4 h-4 mr-1" />
                                                Réouvrir
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {threadMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageSquareText className="w-12 h-12 text-foreground/20 mb-3" />
                                        <p className="text-foreground/70">
                                            Aucun message dans cette conversation
                                        </p>
                                    </div>
                                ) : (
                                    threadMessages.map((message) => {
                                        const isAdmin = message.sender_role === 'admin';
                                        const isHotel = message.sender_role === 'hotel';

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                                        isAdmin
                                                            ? 'bg-brand/10 border border-brand/20'
                                                            : 'bg-background border border-border'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium text-foreground/70">
                                                            {isAdmin ? 'Admin' : isHotel ? 'Hôtel' : 'Worker'}
                                                        </span>
                                                        <span className="text-xs text-foreground/50">
                                                            {new Date(message.created_at).toLocaleString('fr-FR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                day: '2-digit',
                                                                month: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                                        {message.body}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Reply box */}
                            <div className="p-4 border-t border-border shrink-0">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendReply();
                                            }
                                        }}
                                        placeholder="Écrivez votre réponse..."
                                        className="flex-1 min-h-[80px] max-h-[200px] rounded-xl bg-background border border-border p-3 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand/50 resize-y"
                                        disabled={threadMeta?.status === 'closed'}
                                    />
                                    <Button
                                        className="bg-brand hover:bg-brand-light text-primary-foreground h-10 px-4"
                                        onClick={sendReply}
                                        disabled={sending || !reply.trim() || threadMeta?.status === 'closed'}
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                {threadMeta?.status === 'closed' && (
                                    <p className="text-xs text-foreground/50 mt-2">
                                        Cette conversation est fermée. Réouvrez-la pour envoyer un message.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}