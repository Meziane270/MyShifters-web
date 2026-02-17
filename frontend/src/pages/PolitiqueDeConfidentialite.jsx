import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Sun, Moon, ShieldCheck, Globe } from "lucide-react";

const ASSETS = {
    flagFR: "/assets/img/drapeau-fr.webp",
    flagEN: "/assets/img/drapeau-uk.webp",
    logo: "/assets/img/logo.webp",
};

// ========== UTILS ==========
const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
};

export default function PolitiqueDeConfidentialite() {
    const { theme, setTheme } = useTheme();
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const lang = i18n.language?.startsWith("en") ? "en" : "fr";

    const toggleLang = useCallback(() => {
        i18n.changeLanguage(lang === "en" ? "fr" : "en");
    }, [i18n, lang]);

    // ========== CONTENU BILINGUE ==========
    const content = useMemo(() => {
        const fr = {
            back: "Retour",
            badge: "Politique de confidentialité",
            title: "Politique de confidentialité",
            description:
                "La présente politique de confidentialité décrit la manière dont MyShifters collecte, utilise et protège les données personnelles des utilisateurs du site.",
            summary: "Sommaire",
            effectiveDate: "27 janvier 2025",
            footer: {
                legal: "Mentions légales",
                cgu: "Conditions générales d'utilisation",
                cgs: "Conditions générales de service",
            },
            org: {
                brand: "MyShifters",
                domain: "https://www.myshifters.eu",
                contactEmail: "myshifters-extras@outlook.com",
                legalRep: "Meziane Oulmas",
                hostName: "Netlify, Inc.",
                hostWebsite: "https://www.netlify.com",
                thirdParties: ["Calendly (prise de rendez-vous)", "Hébergeur du site (Netlify)"],
            },
            sections: [
                { id: "responsable", title: "1. Responsable du traitement" },
                { id: "donnees", title: "2. Données collectées" },
                { id: "finalites", title: "3. Finalités du traitement" },
                { id: "base-legale", title: "4. Base légale (RGPD)" },
                { id: "destinataires", title: "5. Destinataires des données" },
                { id: "duree", title: "6. Durée de conservation" },
                { id: "securite", title: "7. Sécurité des données" },
                { id: "droits", title: "8. Droits des utilisateurs" },
                { id: "transferts", title: "9. Transferts hors Union Européenne" },
                { id: "cookies", title: "10. Cookies et traceurs (si applicable)" },
                { id: "modification", title: "11. Modification de la politique" },
            ],
            contact: {
                title: "Contact",
                desc: "Pour toute question relative à la protection des données personnelles :",
            },
            collecteVolontaire: [
                "Nom et prénom",
                "Adresse email",
                "Numéro de téléphone (si fourni)",
                "Message via formulaire de contact",
                "Informations transmises lors de la prise de rendez-vous (ex : Calendly)",
            ],
            collecteAuto: [
                "Adresse IP (souvent pseudonymisée/technique selon les outils)",
                "Type de navigateur / terminal",
                "Données de navigation (pages visitées, temps de chargement, logs techniques)",
            ],
            finalites: [
                "Répondre aux demandes de contact",
                "Organiser des rendez-vous professionnels",
                "Assurer le suivi commercial et la relation client",
                "Améliorer l’expérience utilisateur et la sécurité du site",
                "Respecter les obligations légales",
            ],
            basesLegales: [
                "Le consentement (ex : formulaire, cookies non essentiels)",
                "L’exécution de mesures précontractuelles / contrat (ex : prise de rendez-vous, demande de service)",
                "L’intérêt légitime (ex : sécurité, amélioration, prévention de la fraude)",
                "Le respect d’obligations légales (ex : conservation comptable si applicable)",
            ],
            destinatairesInternes: ["Aux équipes MyShifters habilitées", "À des prestataires techniques (hébergement, outils de prise de rendez-vous, etc.)"],
            durees: [
                "Demandes de contact : durée strictement nécessaire au traitement, puis archivage limité.",
                "Rendez-vous / échanges : durée de la relation commerciale et suivi.",
                "Logs techniques : conservation limitée pour la sécurité et le diagnostic.",
            ],
            dureeNote: "Si tu veux être encore plus précis, on peut définir des durées chiffrées (ex : 12/24/36 mois) selon ton usage.",
            securiteMesures: [
                "Accès restreints aux personnes habilitées",
                "Mesures de sécurité applicatives et réseau (selon architecture)",
                "Surveillance et prévention des abus",
            ],
            droits: [
                "Droit d’accès",
                "Droit de rectification",
                "Droit à l’effacement",
                "Droit d’opposition",
                "Droit à la limitation du traitement",
                "Droit à la portabilité (lorsque applicable)",
                "Droit de retirer votre consentement à tout moment (lorsque le traitement est fondé sur le consentement)",
            ],
            droitsIntro: "Conformément au RGPD, vous disposez notamment des droits suivants :",
            droitsContact: "Toute demande peut être adressée à :",
            droitsCNIL: "Vous disposez également du droit d’introduire une réclamation auprès de la CNIL.",
            transferts:
                "Certains prestataires (ex : outils de rendez-vous, hébergeurs, analytics) peuvent traiter des données en dehors de l’UE. Dans ce cas, MyShifters veille à ce que des garanties appropriées soient mises en place (ex : clauses contractuelles types).",
            cookies:
                "Le site peut utiliser des cookies/traceurs pour fonctionner, mesurer l’audience ou améliorer l’expérience. Lorsque requis, un bandeau de consentement permet d’accepter/refuser les cookies non essentiels.",
            cookiesNote:
                "Si tu utilises Google Analytics, Hotjar, chat, etc., dis-moi lesquels et je te fais une section précise + les catégories (essentiels / analytics / marketing).",
            modification:
                "MyShifters se réserve le droit de modifier la présente politique à tout moment. La version en vigueur est celle publiée sur le site.",
            traceurs: "Traceurs/Cookies : si tu utilises des cookies (analytics, chat, etc.), il est recommandé d’ajouter une bannière de consentement et une section dédiée (voir section 10).",
        };

        const en = {
            back: "Back",
            badge: "Privacy policy",
            title: "Privacy policy",
            description:
                "This privacy policy describes how MyShifters collects, uses and protects the personal data of users of the site.",
            summary: "Summary",
            effectiveDate: "January 27, 2025",
            footer: {
                legal: "Legal notice",
                cgu: "Terms of use",
                cgs: "Terms of service",
            },
            org: {
                brand: "MyShifters",
                domain: "https://www.myshifters.eu",
                contactEmail: "myshifters-extras@outlook.com",
                legalRep: "Meziane Oulmas",
                hostName: "Netlify, Inc.",
                hostWebsite: "https://www.netlify.com",
                thirdParties: ["Calendly (appointment scheduling)", "Website host (Netlify)"],
            },
            sections: [
                { id: "responsable", title: "1. Data controller" },
                { id: "donnees", title: "2. Data collected" },
                { id: "finalites", title: "3. Purposes of processing" },
                { id: "base-legale", title: "4. Legal basis (GDPR)" },
                { id: "destinataires", title: "5. Data recipients" },
                { id: "duree", title: "6. Retention period" },
                { id: "securite", title: "7. Data security" },
                { id: "droits", title: "8. User rights" },
                { id: "transferts", title: "9. Transfers outside the European Union" },
                { id: "cookies", title: "10. Cookies and trackers (if applicable)" },
                { id: "modification", title: "11. Changes to this policy" },
            ],
            contact: {
                title: "Contact",
                desc: "For any questions regarding the protection of personal data:",
            },
            collecteVolontaire: [
                "First and last name",
                "Email address",
                "Phone number (if provided)",
                "Message via contact form",
                "Information transmitted when scheduling appointments (e.g., Calendly)",
            ],
            collecteAuto: [
                "IP address (often pseudonymized/technical depending on tools)",
                "Browser type / device",
                "Browsing data (pages visited, load times, technical logs)",
            ],
            finalites: [
                "Respond to contact requests",
                "Arrange professional appointments",
                "Provide commercial follow-up and customer relations",
                "Improve user experience and site security",
                "Comply with legal obligations",
            ],
            basesLegales: [
                "Consent (e.g., form, non-essential cookies)",
                "Performance of pre-contractual measures / contract (e.g., appointment scheduling, service request)",
                "Legitimate interest (e.g., security, improvement, fraud prevention)",
                "Compliance with legal obligations (e.g., accounting retention if applicable)",
            ],
            destinatairesInternes: ["Authorized MyShifters teams", "Technical service providers (hosting, appointment scheduling tools, etc.)"],
            durees: [
                "Contact requests: duration strictly necessary for processing, then limited archiving.",
                "Appointments / exchanges: duration of the commercial relationship and follow-up.",
                "Technical logs: limited retention for security and diagnostics.",
            ],
            dureeNote: "To be even more precise, we can define specific durations (e.g., 12/24/36 months) according to your usage.",
            securiteMesures: [
                "Restricted access to authorized persons",
                "Application and network security measures (depending on architecture)",
                "Monitoring and abuse prevention",
            ],
            droits: [
                "Right of access",
                "Right to rectification",
                "Right to erasure",
                "Right to object",
                "Right to restriction of processing",
                "Right to data portability (where applicable)",
                "Right to withdraw consent at any time (when processing is based on consent)",
            ],
            droitsIntro: "In accordance with the GDPR, you have the following rights in particular:",
            droitsContact: "Any request can be sent to:",
            droitsCNIL: "You also have the right to lodge a complaint with the CNIL.",
            transferts:
                "Some service providers (e.g., scheduling tools, hosts, analytics) may process data outside the EU. In this case, MyShifters ensures that appropriate safeguards are in place (e.g., standard contractual clauses).",
            cookies:
                "The site may use cookies/trackers to function, measure audience or improve the experience. When required, a consent banner allows accepting/refusing non-essential cookies.",
            cookiesNote:
                "If you use Google Analytics, Hotjar, chat, etc., tell me which ones and I will provide a precise section + categories (essential / analytics / marketing).",
            modification:
                "MyShifters reserves the right to modify this policy at any time. The current version is the one published on the site.",
            traceurs: "Trackers/Cookies: if you use cookies (analytics, chat, etc.), it is recommended to add a consent banner and a dedicated section (see section 10).",
        };

        return lang === "en" ? en : fr;
    }, [lang]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo + retour */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/"
                                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/60"
                                aria-label="Go to top"
                            >
                                <img
                                    src={ASSETS.logo}
                                    alt="MyShifters"
                                    className="h-8 w-8 rounded-md object-contain"
                                />
                                <span className="text-lg font-bold tracking-tight sm:text-xl">
                  MyShifters<span className="text-blue-500">.</span>
                </span>
                            </Link>
                            <div className="hidden sm:block text-sm text-muted-foreground">
                                {content.badge}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Language toggle */}
                            <button
                                onClick={toggleLang}
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
                                aria-label="Toggle language"
                            >
                                <img
                                    src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                                    alt={lang === "en" ? "English" : "Français"}
                                    className="h-4 w-4 rounded-sm object-cover"
                                />
                                <span className="hidden sm:inline">
                  {lang === "en" ? "EN" : "FR"}
                </span>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Theme toggle */}
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted/60"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </button>

                            <Button variant="outline" asChild className="gap-2">
                                <Link to="/">
                                    <ArrowLeft className="h-4 w-4" />
                                    {content.back}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                        {lang === "fr" ? "Date d’entrée en vigueur :" : "Effective date:"}{" "}
                        <span className="ml-1 font-medium text-foreground/90">{content.effectiveDate}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                        {content.title}
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {content.description}
                    </p>
                </div>

                {/* Sommaire */}
                <section className="mt-10 rounded-3xl border bg-card p-6 shadow-sm">
                    <div className="text-lg font-semibold mb-4">{content.summary}</div>
                    <div className="grid gap-2 md:grid-cols-2">
                        {content.sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => scrollToId(s.id)}
                                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Content */}
                <div className="mt-8 space-y-4">
                    {/* 1. Responsable du traitement */}
                    <Section id="responsable" title={content.sections[0].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr" ? "Le responsable du traitement des données est :" : "The data controller is:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Nom commercial :" : "Trading name:"}
                                </strong>{" "}
                                {content.org.brand}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Responsable :" : "Manager:"}
                                </strong>{" "}
                                {content.org.legalRep}
                            </li>
                            <li>
                                <strong className="text-foreground">Email :</strong>{" "}
                                <a href={`mailto:${content.org.contactEmail}`} className="underline hover:opacity-80">
                                    {content.org.contactEmail}
                                </a>
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Site web :" : "Website:"}
                                </strong>{" "}
                                {content.org.domain}
                            </li>
                        </ul>
                    </Section>

                    {/* 2. Données collectées */}
                    <Section id="donnees" title={content.sections[1].title}>
                        <p className="text-sm text-muted-foreground">
                            {content.org.brand}{" "}
                            {lang === "fr"
                                ? "collecte uniquement les données nécessaires au fonctionnement du service, au suivi des demandes et à l’amélioration du site."
                                : "only collects the data necessary for the operation of the service, tracking requests and improving the site."}
                        </p>

                        <h3 className="mt-5 text-base font-semibold">
                            {lang === "fr" ? "2.1 Données fournies volontairement" : "2.1 Data provided voluntarily"}
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.collecteVolontaire.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="mt-5 text-base font-semibold">
                            {lang === "fr" ? "2.2 Données collectées automatiquement" : "2.2 Automatically collected data"}
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.collecteAuto.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <p className="mt-3 text-sm text-muted-foreground">
                            <strong className="text-foreground">
                                {lang === "fr" ? "Traceurs/Cookies :" : "Trackers/Cookies:"}
                            </strong>{" "}
                            {content.traceurs}
                        </p>
                    </Section>

                    {/* 3. Finalités du traitement */}
                    <Section id="finalites" title={content.sections[2].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Les données personnelles sont utilisées pour :"
                                : "Personal data is used for:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.finalites.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    {/* 4. Base légale (RGPD) */}
                    <Section id="base-legale" title={content.sections[3].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr" ? "Les traitements reposent sur :" : "Processing is based on:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.basesLegales.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    {/* 5. Destinataires des données */}
                    <Section id="destinataires" title={content.sections[4].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Les données peuvent être accessibles :"
                                : "Data may be accessible to:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.destinatairesInternes.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <p className="mt-3 text-sm text-muted-foreground">
                            {lang === "fr" ? "Prestataires cités :" : "Service providers mentioned:"}
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.org.thirdParties.map((t, idx) => (
                                <li key={idx}>{t}</li>
                            ))}
                        </ul>
                    </Section>

                    {/* 6. Durée de conservation */}
                    <Section id="duree" title={content.sections[5].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Les données sont conservées uniquement le temps nécessaire aux finalités :"
                                : "Data is retained only as long as necessary for the purposes:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.durees.map((item, idx) => (
                                <li key={idx}>
                                    <strong className="text-foreground">{item.split(":")[0]}:</strong> {item.split(":")[1]}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-xs text-muted-foreground italic">
                            {content.dureeNote}
                        </p>
                    </Section>

                    {/* 7. Sécurité des données */}
                    <Section id="securite" title={content.sections[6].title}>
                        <p className="text-sm text-muted-foreground">
                            {content.org.brand}{" "}
                            {lang === "fr"
                                ? "met en œuvre des mesures techniques et organisationnelles afin de protéger les données personnelles contre la perte, l’accès non autorisé, l’altération ou la divulgation."
                                : "implements technical and organizational measures to protect personal data against loss, unauthorized access, alteration or disclosure."}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.securiteMesures.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    {/* 8. Droits des utilisateurs */}
                    <Section id="droits" title={content.sections[7].title}>
                        <p className="text-sm text-muted-foreground">{content.droitsIntro}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.droits.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {content.droitsContact}{" "}
                            <strong className="text-foreground">{content.org.contactEmail}</strong>
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">{content.droitsCNIL}</p>
                    </Section>

                    {/* 9. Transferts hors Union Européenne */}
                    <Section id="transferts" title={content.sections[8].title}>
                        <p className="text-sm text-muted-foreground">{content.transferts}</p>
                    </Section>

                    {/* 10. Cookies et traceurs (si applicable) */}
                    <Section id="cookies" title={content.sections[9].title}>
                        <p className="text-sm text-muted-foreground">{content.cookies}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{content.cookiesNote}</p>
                    </Section>

                    {/* 11. Modification de la politique */}
                    <Section id="modification" title={content.sections[10].title}>
                        <p className="text-sm text-muted-foreground">{content.modification}</p>
                    </Section>
                </div>

                {/* Contact card */}
                <div className="mt-10 rounded-3xl border bg-muted/20 p-6 text-center">
                    <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm">
                        <ShieldCheck className="h-6 w-6 text-brand" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">{content.contact.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{content.contact.desc}</p>
                    <Button asChild className="mt-4">
                        <a href={`mailto:${content.org.contactEmail}`}>{content.org.contactEmail}</a>
                    </Button>
                </div>

                {/* Footer links - uniquement les 3 autres pages */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Link to="/mentions-legales" className="underline hover:opacity-80">
                        {content.footer.legal}
                    </Link>
                    <Link to="/cgu" className="underline hover:opacity-80">
                        {content.footer.cgu}
                    </Link>
                    <Link to="/cgs" className="underline hover:opacity-80">
                        {content.footer.cgs}
                    </Link>
                </div>
            </main>
        </div>
    );
}

function Section({ id, title, children }) {
    return (
        <section id={id} className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="mt-3 space-y-2 text-sm">{children}</div>
        </section>
    );
}