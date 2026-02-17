import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Globe, Sun, Moon, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const ASSETS = {
    bg: "/assets/img/architecture-carpet-chandeliers-design.jpg",
    flagFR: "/assets/img/drapeau-fr.webp",
    flagEN: "/assets/img/drapeau-uk.webp",
    logo: "/assets/img/logo.webp",
};

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const { theme, setTheme } = useTheme();
    const { i18n } = useTranslation();

    const lang = i18n.language?.startsWith("en") ? "en" : "fr";
    const isLight = theme === "light";

    const copy = useMemo(() => {
        const fr = {
            backHome: "Retour à l’accueil",
            backLogin: "Retour à la connexion",
            title: "Nouveau mot de passe",
            subtitle: "Choisissez un nouveau mot de passe.",
            password: "Nouveau mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            submit: "Réinitialiser",
            successTitle: "Mot de passe modifié",
            successDesc: "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.",
            errors: {
                tokenMissing: "Lien invalide ou expiré.",
                passwordMismatch: "Les mots de passe ne correspondent pas.",
                passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
                generic: "Une erreur est survenue.",
            },
        };

        const en = {
            backHome: "Back to home",
            backLogin: "Back to sign in",
            title: "New password",
            subtitle: "Choose a new password.",
            password: "New password",
            confirmPassword: "Confirm password",
            submit: "Reset password",
            successTitle: "Password changed",
            successDesc: "Your password has been updated. You can now sign in.",
            errors: {
                tokenMissing: "Invalid or expired link.",
                passwordMismatch: "Passwords do not match.",
                passwordTooShort: "Password must be at least 8 characters.",
                generic: "Something went wrong.",
            },
        };

        return lang === "en" ? en : fr;
    }, [lang]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error(copy.errors.tokenMissing);
            navigate("/forgot-password", { replace: true });
        }
    }, [token, navigate, copy]);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const toggleLang = useCallback(() => {
        i18n.changeLanguage(lang === "en" ? "fr" : "en");
    }, [i18n, lang]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (loading) return;

            if (password !== confirmPassword) {
                toast.error(copy.errors.passwordMismatch);
                return;
            }

            if (password.length < 8) {
                toast.error(copy.errors.passwordTooShort);
                return;
            }

            setLoading(true);

            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || "";
                const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, new_password: password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.detail || copy.errors.generic);
                }

                setSuccess(true);
                toast.success(copy.successTitle);

                setTimeout(() => navigate("/login"), 3000);
            } catch (err) {
                toast.error(err.message || copy.errors.generic);
            } finally {
                setLoading(false);
            }
        },
        [token, password, confirmPassword, loading, copy, navigate]
    );

    const topBtnClass = isLight
        ? "inline-flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm text-foreground/80 backdrop-blur hover:bg-background/80 transition-colors"
        : "inline-flex items-center gap-2 rounded-lg border bg-background/25 px-3 py-2 text-sm text-white/85 backdrop-blur hover:bg-background/35 transition-colors";

    const topIconBtnClass = isLight
        ? "inline-flex items-center justify-center rounded-lg border bg-background/70 p-2 text-foreground/80 backdrop-blur hover:bg-background/80 transition-colors"
        : "inline-flex items-center justify-center rounded-lg border bg-background/25 p-2 text-white/85 backdrop-blur hover:bg-background/35 transition-colors";

    return (
        <div className="relative min-h-screen text-foreground">

            {/* Clean Background – NO FILTER */}
            <div className="absolute inset-0 -z-10">
                <img
                    src={ASSETS.bg}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Top bar */}
            <div className="absolute left-0 right-0 top-0 z-20">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link to="/" className={topBtnClass}>
                        <ArrowLeft className="h-4 w-4" />
                        {copy.backHome}
                    </Link>

                    <div className="flex items-center gap-2">
                        <button onClick={toggleLang} className={topBtnClass}>
                            <img
                                src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                                alt=""
                                className="h-4 w-4 rounded-sm object-cover"
                            />
                            <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                            <Globe className="h-4 w-4 opacity-80" />
                        </button>

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className={topIconBtnClass}
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="rounded-3xl border bg-background/55 p-6 shadow-2xl backdrop-blur sm:p-8">

                        {!success ? (
                            <>
                                <h1 className="text-2xl font-semibold">{copy.title}</h1>
                                <p className="mt-2 text-sm text-foreground/70">{copy.subtitle}</p>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{copy.password}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                                autoComplete="new-password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleShowPassword}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">{copy.confirmPassword}</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full rounded-2xl py-6 font-semibold">
                                        {loading ? "Updating..." : copy.submit}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-start gap-3 rounded-2xl border bg-background/40 p-4">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <div className="font-semibold">{copy.successTitle}</div>
                                        <p className="text-sm text-foreground/70">{copy.successDesc}</p>
                                    </div>
                                </div>

                                <Button asChild className="w-full rounded-2xl py-6 font-semibold">
                                    <Link to="/login">{copy.backLogin}</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
