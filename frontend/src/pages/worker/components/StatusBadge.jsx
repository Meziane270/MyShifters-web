// src/pages/worker/components/StatusBadge.jsx
import { Badge } from "../../../components/ui/badge";

const statusConfig = {
    // Applications / candidatures
    'application_pending': { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", label: "En attente" },
    'application_accepted': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Acceptée" },
    'application_rejected': { color: "bg-red-500/15 text-red-700 dark:text-red-400", label: "Rejetée" },

    // Missions
    'mission_upcoming': { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400", label: "À venir" },
    'mission_completed': { color: "bg-purple-500/15 text-purple-700 dark:text-purple-400", label: "Terminée" },
    'mission_cancelled': { color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300", label: "Annulée" },

    // Documents
    'document_pending': { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", label: "En attente" },
    'document_approved': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Vérifié" },
    'document_rejected': { color: "bg-red-500/15 text-red-700 dark:text-red-400", label: "Rejeté" },

    // Paiements
    'payment_paid': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Payé" },
    'payment_pending': { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", label: "En attente" },
    'payment_failed': { color: "bg-red-500/15 text-red-700 dark:text-red-400", label: "Échoué" },

    // Support
    'support_open': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Ouvert" },
    'support_pending': { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", label: "En cours" },
    'support_closed': { color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300", label: "Fermé" },

    // Vérification utilisateur
    'user_verified': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Vérifié" },
    'user_unverified': { color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300", label: "Non vérifié" },
    'user_pending': { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", label: "En attente" },
    'user_rejected': { color: "bg-red-500/15 text-red-700 dark:text-red-400", label: "Rejeté" },

    // Onboarding
    'onboarding_registered': { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400", label: "Inscrit" },
    'onboarding_profile_done': { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Profil complété" },
};

export default function StatusBadge({ status, context }) {
    if (!status) {
        return (
            <Badge className="bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-0">
                Inconnu
            </Badge>
        );
    }

    // Construction de la clé avec contexte
    let key = status;
    if (context) {
        key = `${context}_${status}`;
    }

    const config = statusConfig[key] || {
        color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
        label: status
    };

    return (
        <Badge className={`${config.color} border-0`}>
            {config.label}
        </Badge>
    );
}