// src/pages/admin/verifications/AdminVerifications.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { RefreshCw } from "lucide-react";
import VerificationCard from "./components/VerificationCard";
import VerificationModal from "./components/VerificationModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminVerifications() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [workers, setWorkers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'approve' or 'reject'

    const fetchPendingVerifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/verifications/pending`, {
                headers: getAuthHeader()
            });
            setWorkers(res.data.workers || []);
            setHotels(res.data.hotels || []);
        } catch (e) {
            toast.error("Impossible de charger les vérifications");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]); // ← DÉPENDANCE
    useEffect(() => {
        fetchPendingVerifications();
    }, [fetchPendingVerifications]);

    const handleApprove = (user) => {
        setSelectedUser(user);
        setModalType('approve');
        setModalOpen(true);
    };

    const handleReject = (user) => {
        setSelectedUser(user);
        setModalType('reject');
        setModalOpen(true);
    };

    const handleVerify = async (userId, status, reason) => {
        try {
            await axios.post(
                `${API}/admin/users/${userId}/verify`,
                { status, reason },
                { headers: getAuthHeader() }
            );
            toast.success(`Utilisateur ${status === 'verified' ? 'vérifié' : 'rejeté'}`);
            fetchPendingVerifications();
            setModalOpen(false);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la vérification");
        }
    };

    if (loading && workers.length === 0 && hotels.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const totalPending = workers.length + hotels.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Vérifications
                    </h1>
                    <p className="text-foreground/70">
                        {totalPending} utilisateur{totalPending > 1 ? 's' : ''} en attente de vérification
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={fetchPendingVerifications}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            <Tabs defaultValue="workers" className="space-y-6">
                <TabsList className="bg-background border border-border">
                    <TabsTrigger value="workers">
                        Workers ({workers.length})
                    </TabsTrigger>
                    <TabsTrigger value="hotels">
                        Hôtels ({hotels.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workers" className="space-y-4">
                    {workers.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <p className="text-foreground/70">Aucun worker en attente</p>
                        </div>
                    ) : (
                        workers.map(worker => (
                            <VerificationCard
                                key={worker.id}
                                user={worker}
                                type="worker"
                                onApprove={() => handleApprove(worker)}
                                onReject={() => handleReject(worker)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="hotels" className="space-y-4">
                    {hotels.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <p className="text-foreground/70">Aucun hôtel en attente</p>
                        </div>
                    ) : (
                        hotels.map(hotel => (
                            <VerificationCard
                                key={hotel.id}
                                user={hotel}
                                type="hotel"
                                onApprove={() => handleApprove(hotel)}
                                onReject={() => handleReject(hotel)}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>

            <VerificationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                user={selectedUser}
                type={modalType}
                onConfirm={handleVerify}
            />
        </div>
    );
}