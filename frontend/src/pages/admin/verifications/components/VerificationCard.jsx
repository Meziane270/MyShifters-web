// src/pages/admin/verifications/components/VerificationCard.jsx
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
    CheckCircle,
    XCircle,
    FileText,
    Building2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Award,
    Eye,
    Loader2
} from "lucide-react";
import DocumentViewer from "./DocumentViewer";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../../../context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VerificationCard({ user, type, onApprove, onReject, onRefresh }) {
    const { getAuthHeader } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);
    const [docStatuses, setDocStatuses] = useState({});
    const [updatingDoc, setUpdatingDoc] = useState(null);

    const handleDocumentAction = async (docId, status) => {
        setUpdatingDoc(docId);
        try {
            await axios.put(`${API}/admin/documents/${docId}/status`, { status }, { headers: getAuthHeader() });
            setDocStatuses(prev => ({ ...prev, [docId]: status }));
            toast.success(status === "verified" ? "Document approuve" : "Document rejete");
            if (onRefresh) onRefresh();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la mise a jour du document");
        } finally {
            setUpdatingDoc(null);
        }
    };

    const getDocStatus = (doc) => docStatuses[doc.id] || doc.status || "pending";

    const getDocStatusBadge = (status) => {
        switch (status) {
            case "verified": return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Verifie</span>;
            case "rejected": return <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Rejete</span>;
            default: return <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">En attente</span>;
        }
    };

    const getDocLabel = (docType) => {
        switch (docType) {
            case "rib": return "RIB";
            case "cv": return "CV";
            case "business_proof": return "Justificatif entreprise";
            case "identity": return "Piece d identite";
            default: return docType;
        }
    };

    const getIcon = () => {
        if (type === "worker") return <Briefcase className="w-5 h-5" />;
        return <Building2 className="w-5 h-5" />;
    };

    const getTitle = () => {
        if (type === "worker") return user.name;
        return user.hotel_name || user.name;
    };

    const documents = user.documents || [];

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                                {getIcon()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{getTitle()}</h3>
                                    <Link to={`/admin/users/${user.id}`} className="text-brand hover:text-brand-light" title="Voir le profil complet">
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-foreground/70">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground/70">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {type === "worker" && user.address && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground/70">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="border-border">
                                        Inscrit {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: fr })}
                                    </Badge>
                                    {type === "worker" && user.experience_years > 0 && (
                                        <Badge variant="outline" className="border-border">
                                            <Award className="w-3 h-3 mr-1" />
                                            {user.experience_years} an{user.experience_years > 1 ? "s" : ""}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={onApprove}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approuver
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-500/10" onClick={onReject}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeter
                            </Button>
                        </div>
                    </div>
                </div>

                {documents.length > 0 && (
                    <div className="p-6 bg-foreground/5">
                        <h4 className="text-sm font-medium text-foreground mb-3">Documents fournis</h4>
                        <div className="space-y-2">
                            {documents.map((doc) => {
                                const currentStatus = getDocStatus(doc);
                                const isUpdating = updatingDoc === doc.id;
                                return (
                                    <div key={doc.id} className="flex items-center justify-between gap-3 p-3 bg-background rounded-lg border border-border">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="w-5 h-5 text-foreground/70 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground truncate">{getDocLabel(doc.type)}</span>
                                                    {getDocStatusBadge(currentStatus)}
                                                </div>
                                                <div className="text-xs text-foreground/50 truncate">{doc.file?.filename || "Document"}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => setViewingDoc(doc)} className="p-1.5 text-foreground/50 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Voir le document">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {currentStatus !== "verified" && (
                                                <button onClick={() => handleDocumentAction(doc.id, "verified")} disabled={isUpdating} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-50">
                                                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                    Approuver
                                                </button>
                                            )}
                                            {currentStatus !== "rejected" && (
                                                <button onClick={() => handleDocumentAction(doc.id, "rejected")} disabled={isUpdating} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50">
                                                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                    Rejeter
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-border">
                        {expanded ? "Voir moins" : "Voir details"}
                    </button>
                    {expanded && (
                        <div className="mt-4 space-y-4">
                            {type === "worker" && (
                                <>
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground mb-2">Competences</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.skills?.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>) || "Aucune competence"}
                                        </div>
                                    </div>
                                    {user.bio && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-2">Bio</h4>
                                            <p className="text-sm text-foreground/70">{user.bio}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {type === "hotel" && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">Adresse</h4>
                                    <p className="text-sm text-foreground/70">{user.hotel_address || "Non specifiee"}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <DocumentViewer document={viewingDoc} isOpen={source /home/ubuntu/.user_env && cd . && sed -n '125,175p' /home/ubuntu/myshifters/frontend/src/pages/admin/verifications/components/VerificationCard.jsxviewingDoc} onClose={() => setViewingDoc(null)} />
        </>
    );
}
