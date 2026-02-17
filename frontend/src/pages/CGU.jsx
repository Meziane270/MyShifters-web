import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Mail, Sun, Moon, Globe, ArrowLeft } from "lucide-react";

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

export default function CGU() {
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
            badge: "CGU",
            pageTitle: "Conditions Générales d'Utilisation (CGU)",
            pageDesc:
                "Les présentes conditions régissent l’accès et l’utilisation du site MyShifters et de ses services.",
            lastUpdated: "27 janvier 2025",
            lastUpdatedLabel: "Dernière mise à jour :",
            summary: "Sommaire",
            contact: "Contact",
            contactDesc: "Pour toute question relative à l’utilisation du site :",
            domain: "www.myshifters.eu",
            footer: {
                legal: "Mentions légales",
                privacy: "Politique de confidentialité",
                cgs: "Conditions générales de service",
            },
            sections: [
                { id: "objet", title: "1. Objet" },
                { id: "editeur", title: "2. Éditeur du site" },
                { id: "acces", title: "3. Accès au site" },
                { id: "services", title: "4. Services proposés" },
                { id: "mise-en-relation", title: "5. Services professionnels de mise en relation" },
                { id: "obligations", title: "6. Obligations de l’utilisateur" },
                { id: "pi", title: "7. Propriété intellectuelle" },
                { id: "responsabilite", title: "8. Responsabilité" },
                { id: "liens", title: "9. Liens externes" },
                { id: "donnees", title: "10. Données personnelles" },
                { id: "droit", title: "11. Droit applicable" },
                { id: "modification", title: "12. Modification des CGU" },
            ],
            content: {
                objet: "Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités d’accès et d’utilisation du site ",
                objet2: " édité par MyShifters, ainsi que les conditions d’utilisation des services présentés sur le site.",
                editeur: {
                    commercial: "Nom commercial :",
                    manager: "Responsable :",
                    email: "Email :",
                    name: "MyShifters",
                    responsable: "Meziane Oulmas",
                },
                acces: "Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet. MyShifters met en œuvre les moyens raisonnables pour assurer l’accessibilité du site, sans obligation de résultat.",
                services:
                    "Le site MyShifters présente des prestations de services et des solutions d’extras destinées aux établissements hôteliers.",
                servicesInfo:
                    "Les informations présentes sur le site sont fournies à titre indicatif et peuvent être modifiées sans préavis.",
                miseEnRelation:
                    "MyShifters propose également un service professionnel de mise en relation entre établissements hôteliers et travailleurs indépendants (auto-entrepreneurs).",
                miseEnRelationAlert:
                    "Pour les professionnels : l’accès et l’utilisation de ces services sont régis par des <strong>Conditions Générales de Services (CGS)</strong> et une <strong>Convention de Prestation Indépendante</strong>, qui constituent les documents contractuels juridiquement contraignants. Les présentes CGU ne remplacent pas ces documents pour les relations professionnelles.",
                miseEnRelationContact: "Pour obtenir ces documents contractuels :",
                obligations: "L’utilisateur s’engage à :",
                obligationsList: [
                    "Utiliser le site de manière loyale et conforme à la loi.",
                    "Ne pas porter atteinte au bon fonctionnement du site.",
                    "Ne pas exploiter les contenus sans autorisation.",
                ],
                pi: "L’ensemble des contenus présents sur le site (textes, images, logos, structure, code, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou exploitation sans autorisation écrite est strictement interdite.",
                responsabilite:
                    "MyShifters ne saurait être tenu responsable des dommages directs ou indirects résultant de l’utilisation du site, notamment en cas d’interruption, d’erreurs, ou de dysfonctionnement.",
                liens:
                    "Le site peut contenir des liens vers des sites tiers. MyShifters n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.",
                donnees: "Le traitement des données personnelles est détaillé dans notre",
                droit: "Les présentes CGU sont soumises au droit français.",
                modification:
                    "MyShifters se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication en ligne.",
            },
        };

        const en = {
            back: "Back",
            badge: "Terms of Use",
            pageTitle: "Terms of Use",
            pageDesc:
                "These terms govern access to and use of the MyShifters website and its services.",
            lastUpdated: "January 27, 2025",
            lastUpdatedLabel: "Last updated:",
            summary: "Summary",
            contact: "Contact",
            contactDesc: "For any questions regarding the use of the site:",
            domain: "www.myshifters.eu",
            footer: {
                legal: "Legal notice",
                privacy: "Privacy policy",
                cgs: "Terms of service",
            },
            sections: [
                { id: "objet", title: "1. Purpose" },
                { id: "editeur", title: "2. Publisher" },
                { id: "acces", title: "3. Access" },
                { id: "services", title: "4. Services" },
                { id: "mise-en-relation", title: "5. Professional matching services" },
                { id: "obligations", title: "6. User obligations" },
                { id: "pi", title: "7. Intellectual property" },
                { id: "responsabilite", title: "8. Liability" },
                { id: "liens", title: "9. External links" },
                { id: "donnees", title: "10. Personal data" },
                { id: "droit", title: "11. Applicable law" },
                { id: "modification", title: "12. Changes to Terms" },
            ],
            content: {
                objet: "These Terms of Use define the terms of access and use of the website ",
                objet2: " published by MyShifters, as well as the conditions of use of the services presented on the site.",
                editeur: {
                    commercial: "Commercial name:",
                    manager: "Manager:",
                    email: "Email:",
                    name: "MyShifters",
                    responsable: "Meziane Oulmas",
                },
                acces: "The site is freely accessible to any user with an Internet connection. MyShifters implements reasonable means to ensure the accessibility of the site, without obligation of result.",
                services:
                    "The MyShifters site presents service offerings and extra staffing solutions for hotel establishments.",
                servicesInfo:
                    "The information on the site is provided for information purposes only and may be modified without notice.",
                miseEnRelation:
                    "MyShifters also offers a professional matching service between hotel establishments and self-employed workers.",
                miseEnRelationAlert:
                    "For professionals: access to and use of these services are governed by <strong>Terms of Service</strong> and an <strong>Independent Service Agreement</strong>, which constitute the legally binding contractual documents. These Terms of Use do not replace these documents for professional relationships.",
                miseEnRelationContact: "To obtain these contractual documents:",
                obligations: "The user undertakes to:",
                obligationsList: [
                    "Use the site fairly and in accordance with the law.",
                    "Not interfere with the proper functioning of the site.",
                    "Not exploit content without authorization.",
                ],
                pi: "All content on the site (texts, images, logos, structure, code, etc.) is protected by intellectual property law. Any reproduction or exploitation without written authorization is strictly prohibited.",
                responsabilite:
                    "MyShifters cannot be held responsible for direct or indirect damages resulting from the use of the site, particularly in the event of interruption, errors, or malfunction.",
                liens:
                    "The site may contain links to third-party sites. MyShifters has no control over these sites and disclaims all responsibility for their content or practices.",
                donnees: "The processing of personal data is detailed in our",
                droit: "These Terms of Use are governed by French law.",
                modification:
                    "MyShifters reserves the right to modify these Terms of Use at any time. Changes take effect as soon as they are published online.",
            },
        };

        return lang === "en" ? en : fr;
    }, [lang]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header - Navbar identique aux Mentions Légales */}
            <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo + badge de la page */}
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

                        {/* Toggles et retour */}
                        <div className="flex items-center gap-2">
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
                                <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </button>

                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted/60"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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

            {/* Main content */}
            <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
                {/* Header titre + date */}
                <div className="text-center">
                    <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                        {content.lastUpdatedLabel}{" "}
                        <span className="ml-1 font-medium text-foreground/90">{content.lastUpdated}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                        {content.pageTitle}
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {content.pageDesc}
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

                {/* Articles */}
                <div className="mt-8 space-y-4">
                    {/* 1 */}
                    <section id="objet" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[0].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {content.content.objet}
                            <strong>{content.domain}</strong>
                            {content.content.objet2}
                        </p>
                    </section>

                    {/* 2 */}
                    <section id="editeur" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[1].title}</h2>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <span className="font-semibold text-foreground">{content.content.editeur.commercial}</span>{" "}
                                {content.content.editeur.name}
                            </li>
                            <li>
                                <span className="font-semibold text-foreground">{content.content.editeur.manager}</span>{" "}
                                {content.content.editeur.responsable}
                            </li>
                            <li>
                                <span className="font-semibold text-foreground">{content.content.editeur.email}</span>{" "}
                                <a
                                    className="underline underline-offset-4 hover:opacity-80"
                                    href="mailto:myshifters-extras@outlook.com"
                                >
                                    myshifters-extras@outlook.com
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* 3 */}
                    <section id="acces" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[2].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.acces}</p>
                    </section>

                    {/* 4 */}
                    <section id="services" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[3].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.services}</p>
                        <div className="mt-4 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-sm">
                            <p className="font-medium text-foreground">{content.content.servicesInfo}</p>
                        </div>
                    </section>

                    {/* 5 */}
                    <section id="mise-en-relation" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[4].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.miseEnRelation}</p>
                        <div
                            className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
                            dangerouslySetInnerHTML={{ __html: content.content.miseEnRelationAlert }}
                        />
                        <p className="mt-3 text-sm text-muted-foreground">
                            {content.content.miseEnRelationContact}{" "}
                            <a
                                className="underline underline-offset-4 hover:opacity-80"
                                href="mailto:myshifters-extras@outlook.com"
                            >
                                myshifters-extras@outlook.com
                            </a>
                        </p>
                    </section>

                    {/* 6 */}
                    <section id="obligations" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[5].title}</h2>
                        <p className="mt-3 text-sm text-muted-foreground">{content.content.obligations}</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {content.content.obligationsList.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 7 */}
                    <section id="pi" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[6].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.pi}</p>
                    </section>

                    {/* 8 */}
                    <section id="responsabilite" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[7].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.responsabilite}</p>
                    </section>

                    {/* 9 */}
                    <section id="liens" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[8].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.liens}</p>
                    </section>

                    {/* 10 */}
                    <section id="donnees" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[9].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {content.content.donnees}{" "}
                            <Link
                                className="underline underline-offset-4 hover:opacity-80"
                                to="/politique-de-confidentialite"
                            >
                                {content.footer.privacy}
                            </Link>
                            .
                        </p>
                    </section>

                    {/* 11 */}
                    <section id="droit" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[10].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.droit}</p>
                    </section>

                    {/* 12 */}
                    <section id="modification" className="rounded-3xl border bg-card p-6 shadow-sm scroll-mt-24">
                        <h2 className="text-xl font-semibold">{content.sections[11].title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.content.modification}</p>
                    </section>
                </div>

                {/* Contact */}
                <section className="mt-10 rounded-3xl border bg-muted/20 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-brand p-3 text-primary-foreground">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-lg font-semibold">{content.contact}</div>
                            <p className="mt-1 text-sm text-muted-foreground">{content.contactDesc}</p>
                            <a
                                href="mailto:myshifters-extras@outlook.com"
                                className="mt-3 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                myshifters-extras@outlook.com
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer links - 3 pages uniquement */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Link to="/mentions-legales" className="hover:underline">
                        {content.footer.legal}
                    </Link>
                    <Link to="/politique-de-confidentialite" className="hover:underline">
                        {content.footer.privacy}
                    </Link>
                    <Link to="/cgs" className="hover:underline">
                        {content.footer.cgs}
                    </Link>
                </div>
            </main>
        </div>
    );
}