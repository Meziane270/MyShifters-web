import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Sun, Moon, Globe } from "lucide-react";

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

export default function MentionsLegalesPage() {
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
            badge: "Mentions légales",
            title: "Mentions légales",
            description:
                "Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), voici les informations légales concernant le site internet MyShifters.",
            summary: "Sommaire",
            lastUpdated: "27 janvier 2025",
            footer: {
                privacy: "Politique de confidentialité",
                cgu: "Conditions générales d'utilisation",
                cgs: "Conditions générales de service",
            },
            company: {
                brand: "MyShifters",
                domain: "https://www.myshifters.eu",
                legalRep: "Meziane Oulmas",
                phone: "+33 7 49 06 03 05",
                email: "myshifters-extras@outlook.com",
                status: "SASU (à confirmer)",
                address: "[À compléter]",
                siret: "[À compléter]",
                vat: "[À compléter]",
                hostName: "Netlify, Inc.",
                hostWebsite: "https://www.netlify.com",
                hostAddress: "512 2nd Street, Suite 200, San Francisco, CA 94107, United States",
            },
            sections: [
                { id: "editeur", title: "1. Éditeur du site" },
                { id: "publication", title: "2. Directeur de la publication" },
                { id: "hebergement", title: "3. Hébergement du site" },
                { id: "activite", title: "4. Activité" },
                { id: "propriete", title: "5. Propriété intellectuelle" },
                { id: "donnees", title: "6. Données personnelles" },
                { id: "responsabilite", title: "7. Limitation de responsabilité" },
                { id: "liens", title: "8. Liens hypertextes" },
                { id: "droit", title: "9. Droit applicable et juridiction compétente" },
            ],
            contact: {
                title: "Contact",
                desc: "Pour toute question concernant les mentions légales :",
            },
            hint: "Astuce : si certaines informations ne sont pas encore disponibles (SIRET/TVA/adresse), soit tu les complètes avant mise en prod, soit tu remplaces temporairement par “En cours d’immatriculation” (si c’est vrai).",
            hostingNote:
                "Selon ton architecture, le backend / base de données peuvent être hébergés par un autre prestataire. Tu peux ajouter ce prestataire ici si tu veux être 100% exhaustif.",
            activities: [
                "Fourniture de personnel extra hôtelier",
                "Gestion d'extras en réception, housekeeping, restauration",
                "Services de maintenance technique pour établissements",
                "Conseil et accompagnement opérationnel",
            ],
        };

        const en = {
            back: "Back",
            badge: "Legal notice",
            title: "Legal notice",
            description:
                "In accordance with the provisions of Law No. 2004-575 of June 21, 2004 for confidence in the digital economy (LCEN), here is the legal information concerning the MyShifters website.",
            summary: "Summary",
            lastUpdated: "January 27, 2025",
            footer: {
                privacy: "Privacy policy",
                cgu: "Terms of use",
                cgs: "Terms of service",
            },
            company: {
                brand: "MyShifters",
                domain: "https://www.myshifters.eu",
                legalRep: "Meziane Oulmas",
                phone: "+33 7 49 06 03 05",
                email: "myshifters-extras@outlook.com",
                status: "SASU (to be confirmed)",
                address: "[To be completed]",
                siret: "[To be completed]",
                vat: "[To be completed]",
                hostName: "Netlify, Inc.",
                hostWebsite: "https://www.netlify.com",
                hostAddress: "512 2nd Street, Suite 200, San Francisco, CA 94107, United States",
            },
            sections: [
                { id: "editeur", title: "1. Website publisher" },
                { id: "publication", title: "2. Publication director" },
                { id: "hebergement", title: "3. Hosting" },
                { id: "activite", title: "4. Activity" },
                { id: "propriete", title: "5. Intellectual property" },
                { id: "donnees", title: "6. Personal data" },
                { id: "responsabilite", title: "7. Limitation of liability" },
                { id: "liens", title: "8. Hypertext links" },
                { id: "droit", title: "9. Applicable law and jurisdiction" },
            ],
            contact: {
                title: "Contact",
                desc: "For any questions regarding the legal notice:",
            },
            hint: "Tip: if some information is not yet available (SIRET/VAT/address), either complete it before production, or temporarily replace with 'Pending registration' (if true).",
            hostingNote:
                "Depending on your architecture, the backend / databases may be hosted by another provider. You can add this provider here if you want to be 100% exhaustive.",
            activities: [
                "Provision of extra hotel staff",
                "Management of extras in reception, housekeeping, catering",
                "Technical maintenance services for establishments",
                "Consulting and operational support",
            ],
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
                        {lang === "fr" ? "Dernière mise à jour :" : "Last updated:"}{" "}
                        <span className="ml-1 font-medium text-foreground/90">{content.lastUpdated}</span>
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
                    {/* 1. Éditeur */}
                    <Section id="editeur" title={content.sections[0].title}>
                        <p>
                            {lang === "fr" ? "Le site" : "The site"} <strong>{content.company.domain}</strong>{" "}
                            {lang === "fr" ? "est édité par :" : "is published by:"}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Nom commercial :" : "Trading name:"}
                                </strong>{" "}
                                {content.company.brand}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Statut :" : "Legal status:"}
                                </strong>{" "}
                                {content.company.status}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Représentant légal :" : "Legal representative:"}
                                </strong>{" "}
                                {content.company.legalRep}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Adresse :" : "Address:"}
                                </strong>{" "}
                                {content.company.address}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Téléphone :" : "Phone:"}
                                </strong>{" "}
                                {content.company.phone}
                            </li>
                            <li>
                                <strong className="text-foreground">Email :</strong>{" "}
                                <a href={`mailto:${content.company.email}`} className="underline hover:opacity-80">
                                    {content.company.email}
                                </a>
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Numéro SIRET :" : "SIRET number:"}
                                </strong>{" "}
                                {content.company.siret}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "N° TVA intracommunautaire :" : "VAT number:"}
                                </strong>{" "}
                                {content.company.vat}
                            </li>
                        </ul>
                        <p className="mt-3 text-xs text-muted-foreground italic">
                            {content.hint}
                        </p>
                    </Section>

                    {/* 2. Directeur publication */}
                    <Section id="publication" title={content.sections[1].title}>
                        <p>{lang === "fr" ? "Le directeur de la publication est :" : "The publication director is:"}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>
                                <strong className="text-foreground">{lang === "fr" ? "Nom :" : "Name:"}</strong>{" "}
                                {content.company.legalRep}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Qualité :" : "Position:"}
                                </strong>{" "}
                                {lang === "fr" ? "Responsable de publication" : "Publication manager"}
                            </li>
                            <li>
                                <strong className="text-foreground">Contact :</strong>{" "}
                                <a href={`mailto:${content.company.email}`} className="underline hover:opacity-80">
                                    {content.company.email}
                                </a>
                            </li>
                        </ul>
                    </Section>

                    {/* 3. Hébergement */}
                    <Section id="hebergement" title={content.sections[2].title}>
                        <p>{lang === "fr" ? "Le site est hébergé par :" : "The site is hosted by:"}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Hébergeur :" : "Host:"}
                                </strong>{" "}
                                {content.company.hostName}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Adresse :" : "Address:"}
                                </strong>{" "}
                                {content.company.hostAddress}
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    {lang === "fr" ? "Site web :" : "Website:"}
                                </strong>{" "}
                                <a
                                    className="underline hover:opacity-80"
                                    href={content.company.hostWebsite}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {content.company.hostWebsite}
                                </a>
                            </li>
                        </ul>
                        <p className="mt-3 text-sm text-muted-foreground">{content.hostingNote}</p>
                    </Section>

                    {/* 4. Activité */}
                    <Section id="activite" title={content.sections[3].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "MyShifters est spécialisé dans la mise à disposition de personnel extra pour le secteur hôtelier et des établissements haut de gamme."
                                : "MyShifters specializes in providing extra staff for the hotel industry and upscale establishments."}
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {content.activities.map((act, idx) => (
                                <li key={idx}>{act}</li>
                            ))}
                        </ul>
                    </Section>

                    {/* 5. Propriété intellectuelle */}
                    <Section id="propriete" title={content.sections[4].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? `L'ensemble des éléments constitutifs du site ${content.company.domain} (structure, textes, images, logos, marques, éléments graphiques, bases de données, applications) est la propriété exclusive de ${content.company.brand} ou de ses partenaires, et est protégé par le droit d’auteur, le droit des marques et le droit de la propriété intellectuelle.`
                                : `All elements constituting the site ${content.company.domain} (structure, texts, images, logos, trademarks, graphic elements, databases, applications) are the exclusive property of ${content.company.brand} or its partners, and are protected by copyright, trademark law and intellectual property law.`}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de ${content.company.brand}."
                                : "Any reproduction, representation, modification, publication or adaptation of all or part of the site's elements, regardless of the means or process used, is prohibited without the prior written authorization of ${content.company.brand}."}
                        </p>
                    </Section>

                    {/* 6. Données personnelles */}
                    <Section id="donnees" title={content.sections[5].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Conformément à la loi “Informatique et Libertés” et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant."
                                : "In accordance with the French Data Protection Act and the General Data Protection Regulation (GDPR), you have the right to access, rectify, delete and object to data concerning you."}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Pour exercer ces droits, vous pouvez nous contacter à l'adresse :"
                                : "To exercise these rights, you can contact us at:"}{" "}
                            <strong className="text-foreground">{content.company.email}</strong>.
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Pour plus d’informations, consultez notre"
                                : "For more information, see our"}{" "}
                            <Link to="/politique-de-confidentialite" className="underline hover:opacity-80">
                                {content.footer.privacy}
                            </Link>.
                        </p>
                    </Section>

                    {/* 7. Limitation de responsabilité */}
                    <Section id="responsabilite" title={content.sections[6].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? `${content.company.brand} s’efforce d’assurer au mieux l’exactitude et la mise à jour des informations diffusées sur son site, et se réserve le droit de corriger, à tout moment et sans préavis, le contenu.`
                                : `${content.company.brand} strives to ensure the accuracy and updating of information published on its site, and reserves the right to correct the content at any time and without notice.`}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {lang === "fr"
                                ? `${content.company.brand} ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site. L'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.`
                                : `${content.company.brand} cannot guarantee the accuracy, precision or completeness of the information made available on this site. The user acknowledges using this information under their exclusive responsibility.`}
                        </p>
                    </Section>

                    {/* 8. Liens hypertextes */}
                    <Section id="liens" title={content.sections[7].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? `Le site peut contenir des liens hypertextes vers d’autres sites. ${content.company.brand} n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leur accessibilité, leur fonctionnement ou leurs politiques.`
                                : `The site may contain hypertext links to other sites. ${content.company.brand} has no control over these sites and disclaims all responsibility for their content, accessibility, operation or policies.`}
                        </p>
                    </Section>

                    {/* 9. Droit applicable */}
                    <Section id="droit" title={content.sections[8].title}>
                        <p className="text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut d'accord amiable, les tribunaux français seront seuls compétents."
                                : "These legal notices are governed by French law. In the event of a dispute and failing an amicable agreement, the French courts shall have sole jurisdiction."}
                        </p>
                    </Section>
                </div>

                {/* Contact */}
                <div className="mt-10 rounded-3xl border bg-muted/20 p-6 text-center">
                    <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm">
                        <Mail className="h-6 w-6 text-brand" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">{content.contact.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{content.contact.desc}</p>
                    <Button asChild className="mt-4">
                        <a href={`mailto:${content.company.email}`}>{content.company.email}</a>
                    </Button>
                </div>

                {/* Footer links */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Link to="/politique-de-confidentialite" className="underline hover:opacity-80">
                        {content.footer.privacy}
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