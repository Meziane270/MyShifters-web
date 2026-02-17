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
    User,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Award
} from "lucide-react";
import DocumentViewer from "./DocumentViewer";

export default function VerificationCard({ user, type, onApprove, onReject }) {
    const [expanded, setExpanded] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    const getIcon = () => {
        if (type === 'worker') return <Briefcase className="w-5 h-5" />;
        return <Building2 className="w-5 h-5" />;
    };

    const getTitle = () => {
        if (type === 'worker') return user.name;
        return user.hotel_name || user.name;
    };

    const getSubtitle = () => {
        if (type === 'worker') {
            const skills = user.skills?.slice(0, 3) || [];
            return skills.join(' • ') || 'Aucune compétence';
        }
        return user.city || 'Ville non spécifiée';
    };

    const documents = user.documents || [];

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                                {getIcon()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">
                                    {getTitle()}
                                </h3>
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
                                {type === 'worker' && user.address && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground/70">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="border-border">
                                        Inscrit {formatDistanceToNow(new Date(user.created_at), {
                                        addSuffix: true,
                                        locale: fr
                                    })}
                                    </Badge>
                                    {type === 'worker' && user.experience_years > 0 && (
                                        <Badge variant="outline" className="border-border">
                                            <Award className="w-3 h-3 mr-1" />
                                            {user.experience_years} an{user.experience_years > 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                onClick={onApprove}
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approuver
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                                onClick={onReject}
                            >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeter
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Documents */}
                {documents.length > 0 && (
                    <div className="p-6 bg-foreground/5">
                        <h4 className="text-sm font-medium text-foreground mb-3">
                            Documents fournis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setViewingDoc(doc)}
                                    className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-brand/50 transition-colors"
                                >
                                    <FileText className="w-5 h-5 text-foreground/70" />
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="text-sm font-medium text-foreground truncate">
                                            {doc.type === 'rib' && 'RIB'}
                                            {doc.type === 'cv' && 'CV'}
                                            {doc.type === 'business_proof' && 'Justificatif entreprise'}
                                            {doc.type === 'identity' && 'Pièce d\'identité'}
                                        </div>
                                        <div className="text-xs text-foreground/50 truncate">
                                            {doc.file?.filename || 'Document'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expandable details */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm text-brand hover:text-brand-light font-medium"
                    >
                        {expanded ? 'Voir moins' : 'Voir détails'}
                    </button>

                    {expanded && (
                        <div className="mt-4 space-y-4">
                            {type === 'worker' && (
                                <>
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground mb-2">
                                            Compétences
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.skills?.map((skill) => (
                                                <Badge key={skill} variant="secondary">
                                                    {skill}
                                                </Badge>
                                            )) || 'Aucune compétence'}
                                        </div>
                                    </div>

                                    {user.bio && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-2">
                                                Bio
                                            </h4>
                                            <p className="text-sm text-foreground/70">
                                                {user.bio}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {type === 'hotel' && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">
                                        Adresse
                                    </h4>
                                    <p className="text-sm text-foreground/70">
                                        {user.hotel_address || 'Non spécifiée'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <DocumentViewer
                document={viewingDoc}
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
            />
        </>
    );
}