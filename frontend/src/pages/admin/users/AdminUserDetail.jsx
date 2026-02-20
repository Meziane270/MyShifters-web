// src/pages/admin/users/AdminUserDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import StatusPill from "../components/StatusPill";
import UserSuspensionModal from "./components/UserSuspensionModal";
import PasswordResetModal from "./components/PasswordResetModal";
import {
    ArrowLeft,
    User,
    Building2,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    FileText,
    CreditCard,
    AlertTriangle,
    Key,
    Ban,
    Clock,
    DollarSign
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export default function AdminUserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);
    const [updatingDoc, setUpdatingDoc] = useState(null);
    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/users/${userId}`, {
                headers: getAuthHeader()
            });
            setUserData(res.data);
        } catch (e) {
            toast.error("Impossible de charger le profil utilisateur");
            navigate("/admin/users");
        } finally {
            setLoading(false);
        }
    }, [userId, getAuthHeader, navigate]);
    const handleDocumentAction = useCallback(async (docId, status) => {
        setUpdatingDoc(docId);
        try {
            await axios.put(`${API}/admin/documents/${docId}/status`, { status }, { headers: getAuthHeader() });
            toast.success(status === 'verified' ? 'Document approuvé' : 'Document rejeté');
            fetchUser();
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Erreur lors de la mise à jour du document');
        } finally {
            setUpdatingDoc(null);
        }
    }, [getAuthHeader, fetchUser]);
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading || !userData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { user } = userData;
    const isHotel = user.role === 'hotel';
    const isWorker = user.role === 'worker';
    const isSuspended = user.suspensions?.some(s => s.status === 'active');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => navigate("/admin/users")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        {isHotel ? user.hotel_name || user.name : user.name}
                    </h1>
                    <p className="text-foreground/70">
                        Profil {isHotel ? "hôtel" : isWorker ? "worker" : "admin"}
                    </p>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                            <div className="text-xs text-foreground/60">Membre depuis</div>
                            <div className="font-medium text-foreground">
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                </div>

                {isWorker && (
                    <>
                        <div className="p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">Missions</div>
                                    <div className="font-medium text-foreground">
                                        {user.total_completed || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">Gagné</div>
                                    <div className="font-medium text-foreground">
                                        {user.total_earned?.toLocaleString() || 0} €
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {isHotel && (
                    <>
                        <div className="p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">Shifts créés</div>
                                    <div className="font-medium text-foreground">
                                        {user.total_shifts || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">Dépensé</div>
                                    <div className="font-medium text-foreground">
                                        {user.total_spent?.toLocaleString() || 0} €
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="p-4 bg-card rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.verification_status === 'verified'
                                ? 'bg-emerald-500/10'
                                : 'bg-orange-500/10'
                        }`}>
                            <Award className={`w-5 h-5 ${
                                user.verification_status === 'verified'
                                    ? 'text-emerald-600'
                                    : 'text-orange-600'
                            }`} />
                        </div>
                        <div>
                            <div className="text-xs text-foreground/60">Vérification</div>
                            <StatusPill status={user.verification_status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-xl">
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => setPasswordResetModalOpen(true)}
                >
                    <Key className="w-4 h-4 mr-2" />
                    Réinitialiser mot de passe
                </Button>

                {isSuspended ? (
                    <Button
                        variant="outline"
                        className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => setSuspensionModalOpen(true)}
                    >
                        <Ban className="w-4 h-4 mr-2" />
                        Lever la suspension
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                        onClick={() => setSuspensionModalOpen(true)}
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Suspendre
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="bg-background border border-border">
                    <TabsTrigger value="info">Informations</TabsTrigger>
                    {isWorker && (
                        <>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="paiement">Paiement</TabsTrigger>
                            <TabsTrigger value="experiences">Expériences</TabsTrigger>
                        </>
                    )}
                    {isHotel && (
                        <TabsTrigger value="factures">Factures</TabsTrigger>
                    )}
                    <TabsTrigger value="suspensions">Suspensions</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-foreground/60">Email</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-foreground/50" />
                                    <span className="text-foreground">{user.email}</span>
                                </div>
                            </div>
                            {user.phone && (
                                <div>
                                    <div className="text-xs text-foreground/60">Téléphone</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-foreground/50" />
                                        <span className="text-foreground">{user.phone}</span>
                                    </div>
                                </div>
                            )}
                            {isHotel && user.hotel_address && (
                                <div className="col-span-2">
                                    <div className="text-xs text-foreground/60">Adresse</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-foreground/50" />
                                        <span className="text-foreground">{user.hotel_address}</span>
                                    </div>
                                </div>
                            )}
                            {isWorker && user.address && (
                                <div className="col-span-2">
                                    <div className="text-xs text-foreground/60">Adresse</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-foreground/50" />
                                        <span className="text-foreground">{user.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isWorker && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4">Compétences</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills?.map((skill) => (
                                    <Badge key={skill} variant="secondary">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                            {user.bio && (
                                <div className="mt-4">
                                    <div className="text-xs text-foreground/60 mb-2">Bio</div>
                                    <p className="text-foreground/70">{user.bio}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {isHotel && user.business_profile && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4">Informations entreprise</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-foreground/60">Nom de l'entreprise</div>
                                    <div className="text-foreground">{user.business_profile.business_name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">SIRET</div>
                                    <div className="text-foreground">{user.business_profile.siret}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-foreground/60">Adresse</div>
                                    <div className="text-foreground">{user.business_profile.business_address}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {isWorker && (
                    <TabsContent value="documents">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4">Documents fournis</h3>
                            {user.documents?.length === 0 ? (
                                <p className="text-foreground/70">Aucun document</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.documents?.map((doc) => (
                                        <div key={doc.id} className="p-4 bg-background rounded-lg border border-border space-y-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-foreground/70" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-foreground truncate">
                                                        {doc.type === 'rib' && 'RIB'}
                                                        {doc.type === 'cv' && 'CV'}
                                                        {doc.type === 'business_proof' && 'Justificatif entreprise'}
                                                        {doc.type === 'identity' && 'Pièce d\'identité'}
                                                    </div>
                                                    <div className="text-xs text-foreground/50">
                                                        {doc.status === 'pending' ? 'En attente' : doc.status === 'verified' ? 'Vérifié' : 'Rejeté'}
                                                    </div>
                                                </div>
                                                <StatusPill status={doc.status} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {doc.url && (
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> Voir le fichier
                                                    </a>
                                                )}
                                                <div className="flex-1" />
                                                {doc.status !== 'verified' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 text-xs h-7 px-2"
                                                        onClick={() => handleDocumentAction(doc.id, 'verified')}
                                                        disabled={updatingDoc === doc.id}
                                                    >
                                                        {updatingDoc === doc.id ? '...' : 'Approuver'}
                                                    </Button>
                                                )}
                                                {doc.status !== 'rejected' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500/50 text-red-600 hover:bg-red-500/10 text-xs h-7 px-2"
                                                        onClick={() => handleDocumentAction(doc.id, 'rejected')}
                                                        disabled={updatingDoc === doc.id}
                                                    >
                                                        {updatingDoc === doc.id ? '...' : 'Rejeter'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                )}

                {isWorker && (
                    <TabsContent value="paiement">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4">Compte de paiement</h3>
                            {user.payout_account ? (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-foreground/60">IBAN</div>
                                        <div className="text-foreground font-mono">
                                            {user.payout_account.iban}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-foreground/60">BIC</div>
                                        <div className="text-foreground font-mono">
                                            {user.payout_account.bic}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <StatusPill status={user.payout_account.status} />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-foreground/70">Aucun compte de paiement configuré</p>
                            )}
                        </div>
                    </TabsContent>
                )}

                {isWorker && (
                    <TabsContent value="experiences">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-foreground mb-4">Expériences professionnelles</h3>
                            {user.experiences?.length === 0 ? (
                                <p className="text-foreground/70">Aucune expérience</p>
                            ) : (
                                <div className="space-y-4">
                                    {user.experiences?.map((exp) => (
                                        <div key={exp.id} className="p-4 bg-background rounded-lg border border-border">
                                            <div className="font-medium text-foreground">{exp.role_title}</div>
                                            <div className="text-sm text-foreground/70">{exp.company}</div>
                                            <div className="text-xs text-foreground/50 mt-1">
                                                {exp.start_date} - {exp.end_date || 'Présent'}
                                            </div>
                                            {exp.description && (
                                                <p className="text-sm text-foreground/70 mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                )}

                <TabsContent value="suspensions">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-foreground mb-4">Historique des suspensions</h3>
                        {user.suspensions?.length === 0 ? (
                            <p className="text-foreground/70">Aucune suspension</p>
                        ) : (
                            <div className="space-y-4">
                                {user.suspensions?.map((s) => (
                                    <div key={s.id} className="p-4 bg-background rounded-lg border border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Ban className={`w-4 h-4 ${
                                                    s.status === 'active' ? 'text-red-500' : 'text-foreground/50'
                                                }`} />
                                                <span className="font-medium text-foreground">
                                                    {s.status === 'active' ? 'Active' : s.status}
                                                </span>
                                            </div>
                                            <StatusPill status={s.status} />
                                        </div>
                                        <p className="text-sm text-foreground/70 mt-2">{s.reason}</p>
                                        <div className="text-xs text-foreground/50 mt-2">
                                            Par {s.suspended_by_email} • {new Date(s.suspended_at).toLocaleDateString('fr-FR')}
                                            {s.expires_at && ` • Expire le ${new Date(s.expires_at).toLocaleDateString('fr-FR')}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="audit">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-foreground mb-4">Journal d'audit</h3>
                        {user.audit_log?.length === 0 ? (
                            <p className="text-foreground/70">Aucune action enregistrée</p>
                        ) : (
                            <div className="space-y-3">
                                {user.audit_log?.map((log) => (
                                    <div key={log.id} className="p-3 bg-background rounded-lg border border-border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">
                                                {log.action}
                                            </span>
                                            <span className="text-xs text-foreground/50">
                                                {new Date(log.created_at).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-foreground/70 mt-1">
                                            Par {log.admin_email}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <UserSuspensionModal
                isOpen={suspensionModalOpen}
                onClose={() => setSuspensionModalOpen(false)}
                user={user}
                isSuspended={isSuspended}
                onSuccess={fetchUser}
            />

            <PasswordResetModal
                isOpen={passwordResetModalOpen}
                onClose={() => setPasswordResetModalOpen(false)}
                user={user}
                onSuccess={fetchUser}
            />
        </div>
    );
}