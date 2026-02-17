import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";

const SERVICE_LABELS = {
    reception: "Réception",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    restaurant: "Restauration",
};

const SERVICE_COLORS = {
    reception: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    housekeeping: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    maintenance: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    restaurant: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

export default function WorkerProfileDialog({
                                                isOpen,
                                                onClose,
                                                workerProfile,
                                                loading,
                                                error
                                            }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border text-foreground max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">Profil candidat</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-sm text-red-600">{error}</div>
                ) : workerProfile ? (
                    <div className="space-y-4">
                        <div>
                            <div className="text-lg font-semibold">{workerProfile.name}</div>
                            <div className="text-sm text-foreground/70">{workerProfile.email}</div>
                            {workerProfile.phone && (
                                <div className="text-sm text-foreground/70">{workerProfile.phone}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg border border-border bg-background">
                                <div className="text-foreground/60 text-xs">Expérience</div>
                                <div className="font-medium">{workerProfile.experience_years || 0} an(s)</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border bg-background">
                                <div className="text-foreground/60 text-xs">Missions complétées</div>
                                <div className="font-medium">{workerProfile.total_shifts_completed || 0}</div>
                            </div>
                        </div>

                        {Array.isArray(workerProfile.skills) && workerProfile.skills.length > 0 && (
                            <div>
                                <div className="text-sm font-semibold mb-2">Compétences</div>
                                <div className="flex flex-wrap gap-2">
                                    {workerProfile.skills.map((s) => (
                                        <span
                                            key={s}
                                            className={`px-2 py-1 rounded text-xs ${SERVICE_COLORS[s] || "bg-foreground/5 text-foreground/70"}`}
                                        >
                                            {SERVICE_LABELS[s] || s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {workerProfile.bio && (
                            <div>
                                <div className="text-sm font-semibold mb-2">Bio</div>
                                <div className="text-sm text-foreground/70 whitespace-pre-line">
                                    {workerProfile.bio}
                                </div>
                            </div>
                        )}

                        {(workerProfile.business_name || workerProfile.siret) && (
                            <div className="p-3 rounded-lg border border-border bg-background">
                                <div className="text-sm font-semibold mb-1">Entreprise</div>
                                {workerProfile.business_name && (
                                    <div className="text-sm text-foreground/70">{workerProfile.business_name}</div>
                                )}
                                {workerProfile.siret && (
                                    <div className="text-sm text-foreground/70">SIRET : {workerProfile.siret}</div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-foreground/70">
                        Sélectionnez un candidat pour voir son profil.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}