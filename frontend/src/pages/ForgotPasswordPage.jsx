import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Globe, Sun, Moon, Mail, CheckCircle2 } from "lucide-react";

const ASSETS = {
    bg: "/assets/img/architecture-carpet-chandeliers-design.jpg",
    flagFR: "/assets/img/drapeau-fr.webp",
    flagEN: "/assets/img/drapeau-uk.webp",
    logo: "/assets/img/logo.webp",
};

export default function ForgotPasswordPage() {
    const { theme, setTheme } = useTheme();
    const { i18n } = useTranslation();

    const lang = i18n.language?.startsWith("en") ? "en" : "fr";
    const isLight = theme === "light";

    const copy = useMemo(() => {
        const fr = {
            backHome: "Retour à l’accueil",
            backLogin: "Retour à la connexion",
            title: "Mot de passe oublié",
            subtitle: "Entrez votre email. Nous vous enverrons un lien de réinitialisation.",
            email: "Email",
            emailPh: "votre@email.com",
            submit: "Envoyer le lien",
            sentTitle: "Email envoyé",
            sentDesc: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation sous quelques minutes.",
            tip: "Vérifiez vos spams si vous ne recevez rien.",
        };
        const en = {
            backHome: "Back to home",
            backLogin: "Back to sign in",
            title: "Forgot password",
            subtitle: "Enter your email. We’ll send you a reset link.",
            email: "Email",
            emailPh: "you@email.com",
            submit: "Send reset link",
            sentTitle: "Email sent",
            sentDesc: "If an account exists for this email, you’ll receive a reset link within a few minutes.",
            tip: "Check your spam folder if you don’t see it.",
        };
        return lang === "en" ? en : fr;
    }, [lang]);

    // Classes et styles inchangés
    const topBtnClass = isLight
        ? "inline-flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm text-foreground/80 backdrop-blur hover:bg-background/80 transition-colors"
        : "inline-flex items-center gap-2 rounded-lg border bg-background/25 px-3 py-2 text-sm text-white/85 backdrop-blur hover:bg-background/35 transition-colors";

    const topIconBtnClass = isLight
        ? "inline-flex items-center justify-center rounded-lg border bg-background/70 p-2 text-foreground/80 backdrop-blur hover:bg-background/80 transition-colors"
        : "inline-flex items-center justify-center rounded-lg border bg-background/25 p-2 text-white/85 backdrop-blur hover:bg-background/35 transition-colors";

    const bgGradientClass = isLight
        ? "absolute inset-0 bg-gradient-to-b from-white/60 via-white/55 to-white/70"
        : "absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/80";

    const radialClass = isLight
        ? "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.10),transparent_40%)]"
        : "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.18),transparent_40%)]";

    const toggleLang = useCallback(() => {
        i18n.changeLanguage(lang === "en" ? "fr" : "en");
    }, [i18n, lang]);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (loading) return;

            setLoading(true);
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
                const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.detail || (lang === "en" ? "Request failed" : "Échec de la demande"));
                }

                setSent(true);
                toast.success(copy.sentTitle);
            } catch (err) {
                toast.error(err.message || (lang === "en" ? "Something went wrong" : "Une erreur est survenue"));
            } finally {
                setLoading(false);
            }
        },
        [email, copy, lang, loading]
    );

    return (
        <div className="relative min-h-screen text-foreground">
            {/* Background (NO FILTER / NO OVERLAY) */}
            <div className="absolute inset-0 z-0">
                <img
                    src={ASSETS.bg}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Foreground */}
            <div className="relative z-10">
                {/* Top bar */}
                <div className="absolute left-0 right-0 top-0 z-20">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link to="/" className={topBtnClass}>
                            <ArrowLeft className="h-4 w-4" />
                            {copy.backHome}
                        </Link>

                        <div className="flex items-center gap-2">
                            <button onClick={toggleLang} className={topBtnClass} aria-label="Toggle language">
                                <img
                                    src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                                    alt={lang === "en" ? "English" : "Français"}
                                    className="h-4 w-4 rounded-sm object-cover"
                                />
                                <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                                <Globe className={`h-4 w-4 ${isLight ? "opacity-70" : "opacity-80"}`} />
                            </button>

                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className={topIconBtnClass}
                                aria-label="Toggle theme"
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
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-500/20">
                                    <img src={ASSETS.logo} alt="" className="h-7 w-7 object-contain" />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-foreground">
                                        MyShifters<span className="text-blue-600 dark:text-blue-400">.</span>
                                    </div>
                                    <div className="text-sm text-foreground/70">{copy.title}</div>
                                </div>
                            </div>

                            {!sent ? (
                                <>
                                    <h1 className="mt-6 text-2xl font-semibold tracking-tight">{copy.title}</h1>
                                    <p className="mt-2 text-sm text-foreground/80 dark:text-foreground/70">
                                        {copy.subtitle}
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{copy.email}</Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder={copy.emailPh}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    autoComplete="email"
                                                    className={`${isLight ? "bg-background/70" : "bg-background/40"} pl-10`}
                                                />
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} className="w-full rounded-2xl py-6 font-semibold">
                                            {loading ? (
                                                <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    {lang === "en" ? "Sending..." : "Envoi..."}
                    </span>
                                            ) : (
                                                copy.submit
                                            )}
                                        </Button>
                                    </form>

                                    <p className="mt-6 text-center text-sm text-foreground/80 dark:text-foreground/75">
                                        <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                            {copy.backLogin}
                                        </Link>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="mt-6 flex items-start gap-3 rounded-2xl border bg-background/40 p-4">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <div className="font-semibold text-foreground">{copy.sentTitle}</div>
                                            <p className="mt-1 text-sm text-foreground/80 dark:text-foreground/70">{copy.sentDesc}</p>
                                            <p className="mt-2 text-xs text-foreground/60">{copy.tip}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <Button asChild className="w-full rounded-2xl py-6 font-semibold">
                                            <Link to="/login">{copy.backLogin}</Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full rounded-2xl py-6 font-semibold border-foreground/25 text-foreground hover:bg-foreground/5"
                                            onClick={() => {
                                                setSent(false);
                                                setEmail("");
                                            }}
                                            type="button"
                                        >
                                            {lang === "en" ? "Send again" : "Renvoyer"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={`mt-4 text-center text-xs ${isLight ? "text-foreground/60" : "text-white/60"}`}>
                            MyShifters<span className="text-blue-600 dark:text-blue-400">.</span> —{" "}
                            {lang === "en" ? "Hospitality staffing" : "Renfort hôtelier"}
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}