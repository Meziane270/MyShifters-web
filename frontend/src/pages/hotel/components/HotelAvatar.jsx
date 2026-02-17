import { useMemo } from "react";
import { Building2 } from "lucide-react";

const normalizeHotelName = (user) => user?.hotel_name || user?.name || "Hôtel";

const getInitials = (name) => {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return "MS";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function HotelAvatar({ user, size = 48 }) {
    const name = useMemo(() => normalizeHotelName(user), [user]);
    const initials = useMemo(() => getInitials(name), [name]);

    const url = useMemo(() =>
            user?.logo_url ||
            user?.avatar_url ||
            user?.photoURL ||
            user?.photo_url ||
            null,
        [user]);

    if (url) {
        return (
            <img
                src={url}
                alt="Logo"
                style={{ width: size, height: size }}
                className="rounded-full object-cover border border-border"
            />
        );
    }

    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full border border-border bg-background flex items-center justify-center relative overflow-hidden"
            aria-label="Hotel logo placeholder"
            title={name}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
            <Building2 className="w-6 h-6 text-foreground/35 absolute" />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/70 border border-border text-[10px] text-foreground/70">
                {initials}
            </div>
        </div>
    );
}