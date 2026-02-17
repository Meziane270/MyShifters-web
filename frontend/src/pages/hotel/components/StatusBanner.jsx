import { useMemo } from "react";
import { Ban, ShieldAlert, AlertTriangle } from "lucide-react";

const deriveUserStatus = (user) => {
    const direct = user?.status;
    if (direct === "banned" || direct === "disabled" || direct === "verified" || direct === "active") return direct;

    const v = user?.verification_status;
    const onboarding = user?.onboarding_status;
    const disabled = user?.is_disabled || user?.disabled;
    const banned = user?.is_banned || user?.banned;

    if (banned) return "banned";
    if (disabled) return "disabled";
    if (v === "verified") return "verified";
    if (onboarding && onboarding !== "profile_done") return "pending";
    if (v && v !== "verified") return "pending";
    return "pending";
};

export default function StatusBanner({ user }) {
    const status = useMemo(() => deriveUserStatus(user), [user]);

    if (status === "verified" || status === "active") return null;

    if (status === "banned") {
        return (
            <div className="p-4 rounded-xl border border-border bg-background">
                <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                        <div className="font-semibold text-foreground">Compte banni</div>
                        <div className="text-sm text-foreground/70">
                            Votre compte est bloqué. Contactez le support si vous pensez qu'il s'agit d'une erreur.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "disabled") {
        return (
            <div className="p-4 rounded-xl border border-border bg-background">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                        <div className="font-semibold text-foreground">Compte désactivé</div>
                        <div className="text-sm text-foreground/70">
                            Votre compte est désactivé. Contactez le support pour le réactiver.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                    <div className="font-semibold text-foreground">Profil en validation</div>
                    <div className="text-sm text-foreground/70">
                        Votre établissement doit être validé avant d'utiliser toutes les fonctionnalités.
                    </div>
                </div>
            </div>
        </div>
    );
}