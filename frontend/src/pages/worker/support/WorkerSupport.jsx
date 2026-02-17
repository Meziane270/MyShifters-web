import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
    Send, 
    MessageSquare, 
    Clock, 
    CheckCircle2, 
    Loader2,
    Plus,
    LifeBuoy,
    RefreshCw,
    ArrowLeft,
    User
} from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

export default function WorkerSupport() {
    const { user } = useAuth();
    const { fetchData, postData, loading } = useWorkerData();
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [reply, setReply] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const messagesEndRef = useRef(null);

    const loadThreads = useCallback(async () => {
        try {
            const res = await fetchData('/worker/support/threads');
            setThreads(res || []);
        } catch (err) {
            console.error("Erreur support:", err);
        }
    }, [fetchData]);

    useEffect(() => {
        loadThreads();
    }, [loadThreads]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread?.messages]);

    const handleLoadMessages = async (thread) => {
        try {
            const messages = await fetchData(`/worker/support/threads/${thread.id}`);
            setSelectedThread({ ...thread, messages });
            setShowNewTicketForm(false);
        } catch (err) {
            toast.error("Impossible de charger les messages");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newSubject.trim() || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await postData('/worker/support/threads', {
                subject: newSubject,
                message: newMessage
            });
            toast.success("Ticket créé avec succès");
            setNewSubject("");
            setNewMessage("");
            setShowNewTicketForm(false);
            loadThreads();
        } catch (err) {
            toast.error("Erreur lors de la création du ticket");
        } finally {
            setIsSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedThread || isSending) return;

        setIsSending(true);
        try {
            await postData(`/worker/support/threads/${selectedThread.id}/messages`, {
                body: reply
            });
            setReply("");
            const messages = await fetchData(`/worker/support/threads/${selectedThread.id}`);
            setSelectedThread(prev => ({ ...prev, messages }));
            loadThreads();
            toast.success("Message envoyé");
        } catch (err) {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setIsSending(false);
        }
    };

    if (loading && threads.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Connexion au support...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Support</h1>
                    <p className="text-slate-500 font-medium">Une question ? Notre équipe est là pour vous aider.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={loadThreads}
                        className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand transition-all shadow-sm"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => {
                            setShowNewTicketForm(true);
                            setSelectedThread(null);
                        }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-light transition-all shadow-xl shadow-brand/20"
                    >
                        <Plus className="h-5 w-5" />
                        Nouvelle demande
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10 h-[650px]">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-brand" />
                            Mes conversations
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {threads.length > 0 ? (
                            threads.map((thread) => (
                                <button
                                    key={thread.id}
                                    onClick={() => handleLoadMessages(thread)}
                                    className={`w-full p-6 rounded-[2rem] text-left transition-all ${
                                        selectedThread?.id === thread.id 
                                        ? "bg-brand text-white shadow-xl shadow-brand/20" 
                                        : "hover:bg-slate-50 text-slate-600"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold opacity-60">
                                            {new Date(thread.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold truncate">{thread.subject}</h4>
                                    <div className="flex items-center gap-2 mt-3 opacity-60">
                                        {thread.status === 'closed' ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                        ) : (
                                            <Clock className="h-3 w-3" />
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {thread.status === 'closed' ? 'Fermé' : 'En cours'}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <LifeBuoy className="h-12 w-12 text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold text-sm">Aucune conversation en cours.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {showNewTicketForm ? (
                        <div className="p-10 space-y-8 h-full overflow-y-auto">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xl">Nouvelle demande</h3>
                                    <p className="text-sm text-slate-500">Expliquez-nous votre problème en détail.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Sujet</label>
                                    <input 
                                        type="text" 
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        placeholder="Ex: Problème de paiement, Question sur une mission..."
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-medium text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Message</label>
                                    <textarea 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Décrivez votre situation..."
                                        rows={6}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-medium text-sm resize-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full py-5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-light transition-all shadow-xl shadow-brand/20 disabled:opacity-30 flex items-center justify-center gap-3"
                                >
                                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    Envoyer ma demande
                                </button>
                            </form>
                        </div>
                    ) : selectedThread ? (
                        <>
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedThread(null)}
                                        className="lg:hidden p-2 text-slate-400"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{selectedThread.subject}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket #{selectedThread.id}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                    selectedThread.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {selectedThread.status === 'closed' ? 'Fermé' : 'Ouvert'}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                                {selectedThread.messages?.map((msg) => {
                                    const isFromAdmin = msg.sender_role === 'admin' || msg.is_admin;
                                    return (
                                        <div 
                                            key={msg.id} 
                                            className={`flex ${isFromAdmin ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[80%] space-y-2`}>
                                                <div className={`flex items-center gap-2 mb-1 ${isFromAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isFromAdmin ? 'bg-brand text-white' : 'bg-brand text-white'}`}>
                                                        {isFromAdmin ? 'A' : (user?.first_name?.charAt(0) || 'W')}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {isFromAdmin ? 'Support MyShifters' : 'Moi'}
                                                    </span>
                                                </div>
                                                <div className={`p-5 rounded-[2rem] text-sm font-medium shadow-sm ${
                                                    isFromAdmin 
                                                    ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none" 
                                                    : "bg-brand text-white rounded-tr-none"
                                                }`}>
                                                    {msg.body}
                                                </div>
                                                <p className={`text-[10px] font-bold text-slate-400 px-2 ${isFromAdmin ? 'text-left' : 'text-right'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {selectedThread.status !== 'closed' && (
                                <div className="p-6 bg-white border-t border-slate-50">
                                    <form onSubmit={handleSendReply} className="relative">
                                        <input 
                                            type="text" 
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Écrivez votre réponse..."
                                            className="w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-medium text-sm"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!reply.trim() || isSending}
                                            className="absolute right-2 top-2 bottom-2 px-6 bg-brand text-white rounded-2xl hover:bg-brand-light transition-all disabled:opacity-30"
                                        >
                                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                <MessageSquare className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl">Vos messages</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">Sélectionnez une conversation ou créez une nouvelle demande pour discuter avec nous.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
