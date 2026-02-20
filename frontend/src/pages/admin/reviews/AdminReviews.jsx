// src/pages/admin/reviews/AdminReviews.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import StatusPill from "../components/StatusPill";
import {
    RefreshCw,
    Star,
    Eye,
    EyeOff,
    Trash2,
    CheckCircle,
    XCircle
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminReviews() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    });

    const fetchReviews = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/reviews`, {
                headers: getAuthHeader(),
                params: { page, limit: pagination.limit }
            });
            setReviews(res.data.reviews || []);
            setPagination({
                total: res.data.total,
                page: res.data.page,
                limit: res.data.limit,
                pages: res.data.pages
            });
        } catch (e) {
            toast.error("Impossible de charger les avis");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, pagination.limit]); // ← DÉPENDANCES
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleHideReview = async (reviewId) => {
        try {
            await axios.put(
                `${API}/admin/reviews/${reviewId}/hide`,
                {},
                { headers: getAuthHeader() }
            );
            toast.success("Avis masqué");
            fetchReviews(pagination.page);
        } catch (e) {
            toast.error("Erreur lors du masquage");
        }
    };

    const handleVerifyReview = async (reviewId) => {
        try {
            await axios.put(
                `${API}/admin/reviews/${reviewId}/verify`,
                {},
                { headers: getAuthHeader() }
            );
            toast.success("Avis vérifié — visible sur la landing page");
            fetchReviews(pagination.page);
        } catch (e) {
            toast.error("Erreur lors de la vérification");
        }
    };
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Supprimer définitivement cet avis ?")) return;

        try {
            await axios.delete(
                `${API}/admin/reviews/${reviewId}`,
                { headers: getAuthHeader() }
            );
            toast.success("Avis supprimé");
            fetchReviews(pagination.page);
        } catch (e) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-foreground/20'
                }`}
            />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Modération des avis
                    </h1>
                    <p className="text-foreground/70">
                        {pagination.total} avis au total
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => fetchReviews(pagination.page)}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-foreground/70">Auteur / Type</TableHead>
                            <TableHead className="text-foreground/70">Note</TableHead>
                            <TableHead className="text-foreground/70">Avis</TableHead>
                            <TableHead className="text-foreground/70">Date</TableHead>
                            <TableHead className="text-foreground/70">Statut</TableHead>
                            <TableHead className="text-foreground/70 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-foreground/70">
                                    Aucun avis trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id} className="border-border">
                                    <TableCell>
                                        <div className="font-medium text-foreground">
                                            {review.hotel_name || review.worker_id || "Plateforme"}
                                        </div>
                                        {review.for_landing_page && (
                                            <span className="text-xs text-brand font-semibold">Landing page</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="text-sm text-foreground/70 line-clamp-2">
                                            {review.comment}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-foreground/70">
                                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>
                                        {review.visible === false ? (
                                            <Badge className="bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-0">
                                                Masqué
                                            </Badge>
                                        ) : (
                                            <StatusPill status={review.verified ? 'verified' : 'pending'} />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!review.verified && review.visible !== false && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                                                    title="Vérifier et publier"
                                                    onClick={() => handleVerifyReview(review.id)}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {review.visible !== false && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-border"
                                                    title="Masquer"
                                                    onClick={() => handleHideReview(review.id)}
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                                                title="Supprimer"
                                                onClick={() => handleDeleteReview(review.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <div className="text-sm text-foreground/70">
                            Page {pagination.page} sur {pagination.pages}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                disabled={pagination.page === 1}
                                onClick={() => fetchReviews(pagination.page - 1)}
                            >
                                Précédent
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                disabled={pagination.page === pagination.pages}
                                onClick={() => fetchReviews(pagination.page + 1)}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}