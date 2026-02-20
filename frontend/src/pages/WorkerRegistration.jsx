import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

// ====================================================
// FONCTIONS DE VALIDATION – ÉTAPE 1 & 2
// ====================================================
const validateFirstName = (firstName) => {
    if (!firstName || firstName.trim() === "") return "required";
    if (firstName.trim().length < 2) return "minLength";
    return null;
};

const validateLastName = (lastName) => {
    if (!lastName || lastName.trim() === "") return "required";
    if (lastName.trim().length < 2) return "minLength";
    return null;
};

const validateEmail = (email) => {
    if (!email || email.trim() === "") return "required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? null : "format";
};

const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") return null;
    const cleaned = phone.replace(/\s+/g, "");
    const regex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    return regex.test(cleaned) ? null : "format";
};

const validatePassword = (password) => {
    if (!password) return "required";
    if (password.length < 8) return "minLength";
    return null;
};

const validateConfirmPassword = (confirm, password) => {
    if (!confirm) return "required";
    if (confirm !== password) return "mismatch";
    return null;
};

const validateDateOfBirth = (date) => {
    if (!date) return "required";
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return "format";
    const birthDate = new Date(date);
    const today = new Date();
    if (birthDate > today) return "future";
    return null;
};

const validateCity = (city) => {
    if (!city || city.trim() === "") return "required";
    return null;
};

const validatePostalCode = (code) => {
    if (!code || code.trim() === "") return "required";
    const regex = /^[0-9]{5}$/;
    return regex.test(code) ? null : "format";
};

// Step 2 validators
const validateSiret = (siret, required = true) => {
    if (!siret || siret.trim() === "") return required ? "required" : null;
    const cleaned = siret.replace(/\s+/g, "");
    const regex = /^\d{14}$/;
    return regex.test(cleaned) ? null : "format";
};

const validateBillingAddress = (address, required = true) => {
    if (!address || address.trim() === "") return required ? "required" : null;
    return null;
};

const validateBillingCity = (city, required = true) => {
    if (!city || city.trim() === "") return required ? "required" : null;
    return null;
};

const validateBillingPostalCode = (code, required = true) => {
    if (!code || code.trim() === "") return required ? "required" : null;
    const regex = /^[0-9]{5}$/;
    return regex.test(code) ? null : "format";
};

const validateCvFile = (file) => {
    if (!file) return "required";
    return null;
};

// ====================================================
// OBJET VALIDATEURS (pour l'étape 1)
// ====================================================
const validators = {
    first_name: validateFirstName,
    last_name: validateLastName,
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    date_of_birth: validateDateOfBirth,
    city: validateCity,
    postal_code: validatePostalCode,
};

export default function WorkerRegistration({
                                               formData,
                                               setFormData,
                                               loading,
                                               showPassword,
                                               toggleShowPassword,
                                               copy,
                                               lang,
                                               workerStep,
                                               setWorkerStep,
                                               workerTotalSteps,
                                               workerNextLabel,
                                               workerPrevLabel,
                                               onSubmit,
                                               onBack,
                                               handleSkillToggle,
                                               SERVICE_TYPES,
                                           }) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const getFieldError = (field, value, extra) => {
        const validator = validators[field];
        if (!validator) return null;
        if (field === "confirmPassword") {
            return validator(value, extra);
        }
        return validator(value);
    };

    // ====================================================
    // GESTION DES CHAMPS (ÉTAPE 1)
    // ====================================================
    const handleChange = (field, value, extra = null) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };

            setErrors((prevErrors) => {
                const next = {
                    ...prevErrors,
                    [field]: getFieldError(field, value, extra ?? updated.password),
                };

                if (field === "password" && updated.confirmPassword) {
                    next.confirmPassword = getFieldError(
                        "confirmPassword",
                        updated.confirmPassword,
                        value
                    );
                }

                if (field === "confirmPassword") {
                    next.confirmPassword = getFieldError(
                        "confirmPassword",
                        value,
                        updated.password
                    );
                }

                return next;
            });

            return updated;
        });
    };

    // ====================================================
    // GESTION DES CHAMPS SPÉCIFIQUES (ÉTAPE 2)
    // ====================================================
    const handleAEToggle = (checked) => {
        setFormData((prev) => {
            const updated = {
                ...prev,
                has_ae_status: checked,
                // Si on désactive, on remet les champs à vide et on décoche "same_as_personal"
                ...(checked
                    ? {}
                    : {
                        siret: "",
                        billing_address: "",
                        billing_city: "",
                        billing_postal_code: "",
                        same_as_personal: false,
                    }),
            };
            return updated;
        });
        // Effacer les erreurs associées
        setErrors((prev) => ({
            ...prev,
            siret: null,
            billing_address: null,
            billing_city: null,
            billing_postal_code: null,
        }));
    };

    const handleSameAsPersonalToggle = (checked) => {
        setFormData((prev) => {
            const updated = { ...prev, same_as_personal: checked };
            if (checked) {
                // Copier les valeurs des champs personnels
                updated.billing_address = prev.address || "";
                updated.billing_city = prev.city || "";
                updated.billing_postal_code = prev.postal_code || "";
            }
            return updated;
        });
        // Valider les champs après mise à jour
        setTimeout(() => {
            validateStep2Fields();
        }, 0);
    };

    const handleSiretChange = (value) => {
        setFormData((prev) => ({ ...prev, siret: value }));
        // Validation en temps réel
        const error = validateSiret(value, formData.has_ae_status);
        setErrors((prev) => ({ ...prev, siret: error }));
    };

    const handleBillingAddressChange = (value) => {
        setFormData((prev) => ({ ...prev, billing_address: value }));
        const error = validateBillingAddress(
            value,
            formData.has_ae_status && !formData.same_as_personal
        );
        setErrors((prev) => ({ ...prev, billing_address: error }));
    };

    const handleBillingCityChange = (value) => {
        setFormData((prev) => ({ ...prev, billing_city: value }));
        const error = validateBillingCity(
            value,
            formData.has_ae_status && !formData.same_as_personal
        );
        setErrors((prev) => ({ ...prev, billing_city: error }));
    };

    const handleBillingPostalCodeChange = (value) => {
        setFormData((prev) => ({ ...prev, billing_postal_code: value }));
        const error = validateBillingPostalCode(
            value,
            formData.has_ae_status && !formData.same_as_personal
        );
        setErrors((prev) => ({ ...prev, billing_postal_code: error }));
    };

    const handleCvFileChange = (file) => {
        setFormData((prev) => ({ ...prev, cv_pdf: file }));
        const error = validateCvFile(file);
        setErrors((prev) => ({ ...prev, cv_pdf: error }));
    };

    // Validation spécifique pour l'étape 2 (appelée après changements)
    const validateStep2Fields = () => {
        const newErrors = {};
        if (formData.has_ae_status) {
            newErrors.siret = validateSiret(formData.siret, true);
            if (!formData.same_as_personal) {
                newErrors.billing_address = validateBillingAddress(
                    formData.billing_address,
                    true
                );
                newErrors.billing_city = validateBillingCity(formData.billing_city, true);
                newErrors.billing_postal_code = validateBillingPostalCode(
                    formData.billing_postal_code,
                    true
                );
            } else {
                // Même adresse : les champs doivent être remplis (ils le sont via la copie)
                newErrors.billing_address = validateBillingAddress(
                    formData.billing_address,
                    true
                );
                newErrors.billing_city = validateBillingCity(formData.billing_city, true);
                newErrors.billing_postal_code = validateBillingPostalCode(
                    formData.billing_postal_code,
                    true
                );
            }
        }
        newErrors.cv_pdf = validateCvFile(formData.cv_pdf);
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.values(newErrors).every((e) => e === null);
    };

    // ====================================================
    // MESSAGES D'ERREUR LOCALISÉS
    // ====================================================
    const getErrorMessage = (field, errorCode) => {
        if (!errorCode) return null;
        const key = `validation.${field}.${errorCode}`;
        return copy[key] || `${field} error: ${errorCode}`;
    };

    // ====================================================
    // VALIDATION DES ÉTAPES
    // ====================================================
    const isStep1Valid = useMemo(() => {
        if (workerStep !== 1) return true;
        const fields = [
            { field: "first_name", value: formData.first_name },
            { field: "last_name", value: formData.last_name },
            { field: "email", value: formData.email },
            { field: "phone", value: formData.phone },
            { field: "password", value: formData.password },
            { field: "confirmPassword", value: formData.confirmPassword, extra: formData.password },
            { field: "date_of_birth", value: formData.date_of_birth },
            { field: "city", value: formData.city },
            { field: "postal_code", value: formData.postal_code },
        ];
        return fields.every(({ field, value, extra }) => {
            const error = getFieldError(field, value, extra);
            return error === null;
        });
    }, [
        workerStep,
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword,
        formData.date_of_birth,
        formData.city,
        formData.postal_code,
    ]);

    const isStep2Valid = useMemo(() => {
        if (workerStep !== 2) return true;

        // CV toujours requis
        if (!formData.cv_pdf) return false;

        // Si pas AE, seulement le CV est requis
        if (!formData.has_ae_status) {
            return formData.cv_pdf !== null;
        }

        // AE activé : SIRET requis et valide
        const siretValid = validateSiret(formData.siret, true) === null;
        if (!siretValid) return false;

        // Adresse de facturation
        if (formData.same_as_personal) {
            // Les champs sont copiés, ils doivent être remplis (vérifier non vides)
            const addrOk =
                formData.billing_address?.trim() !== "" &&
                formData.billing_city?.trim() !== "" &&
                formData.billing_postal_code?.trim() !== "" &&
                validateBillingPostalCode(formData.billing_postal_code, true) === null;
            return addrOk;
        } else {
            // Champs libres, tous requis et valides
            const addrOk =
                formData.billing_address?.trim() !== "" &&
                formData.billing_city?.trim() !== "" &&
                formData.billing_postal_code?.trim() !== "" &&
                validateBillingPostalCode(formData.billing_postal_code, true) === null;
            return addrOk;
        }
    }, [
        workerStep,
        formData.cv_pdf,
        formData.has_ae_status,
        formData.siret,
        formData.same_as_personal,
        formData.billing_address,
        formData.billing_city,
        formData.billing_postal_code,
    ]);

    const isNextDisabled = useMemo(() => {
        if (workerStep === 1) return !isStep1Valid;
        if (workerStep === 2) return !isStep2Valid;
        return false;
    }, [workerStep, isStep1Valid, isStep2Valid]);

    // Initialisation des champs de facturation si "same_as_personal" est coché au chargement
    useEffect(() => {
        if (workerStep === 2 && formData.same_as_personal) {
            setFormData((prev) => ({
                ...prev,
                billing_address: prev.address || "",
                billing_city: prev.city || "",
                billing_postal_code: prev.postal_code || "",
            }));
        }
    }, [workerStep, formData.same_as_personal, formData.address, formData.city, formData.postal_code, setFormData]);

    return (
        <div className="rounded-3xl border bg-background/55 p-6 shadow-xl backdrop-blur sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-xs text-foreground/90 dark:text-foreground/80">
                        <span className="font-semibold">
                            {copy.mid}
                            <span className="text-blue-600 dark:text-blue-400">.</span>
                        </span>
                        <span className="opacity-70">•</span>
                        <span className="opacity-90 dark:opacity-80">{copy.formTitleShifter}</span>
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                        {copy.formTitleShifter}
                    </h1>
                    <p className="mt-2 text-sm text-foreground/80 dark:text-foreground/70">{copy.formSub}</p>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2 text-sm text-foreground/90 dark:text-foreground/80 hover:bg-background/70 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {copy.back}
                </button>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-5" data-testid="register-form" noValidate>
                {/* Progress - 2 steps */}
                <div className="flex items-center justify-between rounded-2xl border bg-background/40 px-4 py-3 text-sm">
                    <div className="text-foreground/80">
                        {lang === "en" ? "Step" : "Étape"} {workerStep}/{workerTotalSteps}
                    </div>
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-foreground/10">
                        <div
                            className="h-full bg-foreground/40"
                            style={{ width: `${Math.round((workerStep / workerTotalSteps) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* ========== STEP 1 ========== */}
                {workerStep === 1 && (
                    <>

                        {/* Champs d'identité */}
                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Nom */}
                            <div className="space-y-2">
                                <Label htmlFor="last_name">{copy.last_name || "Nom"}</Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    placeholder={copy.placeholders?.last_name || "Dupont"}
                                    value={formData.last_name || ""}
                                    onChange={(e) => handleChange("last_name", e.target.value)}
                                    onBlur={() => handleBlur("last_name")}
                                    required
                                    autoComplete="family-name"
                                    aria-invalid={!!errors.last_name}
                                    aria-describedby={errors.last_name ? "last-name-error" : undefined}
                                    className={touched.last_name && errors.last_name ? "border-red-500" : ""}
                                />
                                {touched.last_name && errors.last_name && (
                                    <p id="last-name-error" className="text-xs text-red-500">
                                        {getErrorMessage("last_name", errors.last_name)}
                                    </p>
                                )}
                            </div>

                            {/* Prénom */}
                            <div className="space-y-2">
                                <Label htmlFor="first_name">{copy.first_name || "Prénom"}</Label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    placeholder={copy.placeholders?.first_name || "Jean"}
                                    value={formData.first_name || ""}
                                    onChange={(e) => handleChange("first_name", e.target.value)}
                                    onBlur={() => handleBlur("first_name")}
                                    required
                                    autoComplete="given-name"
                                    aria-invalid={!!errors.first_name}
                                    aria-describedby={errors.first_name ? "first-name-error" : undefined}
                                    className={touched.first_name && errors.first_name ? "border-red-500" : ""}
                                />
                                {touched.first_name && errors.first_name && (
                                    <p id="first-name-error" className="text-xs text-red-500">
                                        {getErrorMessage("first_name", errors.first_name)}
                                    </p>
                                )}
                            </div>


                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">{copy.email}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={copy.placeholders.email}
                                    value={formData.email || ""}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    onBlur={() => handleBlur("email")}
                                    required
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={touched.email && errors.email ? "border-red-500" : ""}
                                />
                                {touched.email && errors.email && (
                                    <p id="email-error" className="text-xs text-red-500">
                                        {getErrorMessage("email", errors.email)}
                                    </p>
                                )}
                            </div>

                            {/* Téléphone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">{copy.phone}</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder={copy.placeholders.phone}
                                    value={formData.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    onBlur={() => handleBlur("phone")}
                                    autoComplete="tel"
                                    aria-invalid={!!errors.phone}
                                    aria-describedby={errors.phone ? "phone-error" : undefined}
                                    className={touched.phone && errors.phone ? "border-red-500" : ""}
                                />
                                {touched.phone && errors.phone && (
                                    <p id="phone-error" className="text-xs text-red-500">
                                        {getErrorMessage("phone", errors.phone)}
                                    </p>
                                )}
                            </div>

                            {/* Mot de passe + Confirmation */}
                            <div className="space-y-2 sm:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{copy.password}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={copy.placeholders.password}
                                                value={formData.password || ""}
                                                onChange={(e) => handleChange("password", e.target.value)}
                                                onBlur={() => handleBlur("password")}
                                                required
                                                minLength={8}
                                                autoComplete="new-password"
                                                aria-invalid={!!errors.password}
                                                aria-describedby={errors.password ? "password-error" : undefined}
                                                className={`pr-10 ${
                                                    touched.password && errors.password ? "border-red-500" : ""
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleShowPassword}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground focus:outline-none"
                                                aria-label={
                                                    showPassword
                                                        ? "Masquer le mot de passe"
                                                        : "Afficher le mot de passe"
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {touched.password && errors.password && (
                                            <p id="password-error" className="text-xs text-red-500">
                                                {getErrorMessage("password", errors.password)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            {copy.confirmPassword || "Confirmer le mot de passe"}
                                        </Label>

                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={
                                                    copy.placeholders?.confirmPassword || "••••••••"
                                                }
                                                value={formData.confirmPassword || ""}
                                                onChange={(e) =>
                                                    handleChange("confirmPassword", e.target.value)
                                                }
                                                onBlur={() => handleBlur("confirmPassword")}
                                                required
                                                autoComplete="new-password"
                                                aria-invalid={!!errors.confirmPassword}
                                                aria-describedby={
                                                    errors.confirmPassword
                                                        ? "confirm-password-error"
                                                        : undefined
                                                }
                                                className={`pr-10 ${
                                                    touched.confirmPassword && errors.confirmPassword
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={toggleShowPassword}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground focus:outline-none"
                                                aria-label={
                                                    showPassword
                                                        ? "Masquer le mot de passe"
                                                        : "Afficher le mot de passe"
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <p id="confirm-password-error" className="text-xs text-red-500">
                                                {getErrorMessage(
                                                    "confirmPassword",
                                                    errors.confirmPassword
                                                )}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </div>


                            {/* Date de naissance */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="date_of_birth">
                                    {copy.date_of_birth || "Date de naissance"}
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth || ""}
                                        onChange={(e) => handleChange("date_of_birth", e.target.value)}
                                        onBlur={() => handleBlur("date_of_birth")}
                                        required
                                        aria-invalid={!!errors.date_of_birth}
                                        aria-describedby={errors.date_of_birth ? "dob-error" : "dob-help"}
                                        className={`pr-10 ${touched.date_of_birth && errors.date_of_birth ? "border-red-500" : ""}`}
                                    />

                                    {/* calendar icon (lucide-react) */}
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
                                              <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                              >
                                                <path d="M8 2v4M16 2v4" />
                                                <rect width="18" height="18" x="3" y="4" rx="2" />
                                                <path d="M3 10h18" />
                                              </svg>
                                            </span>
                                </div>

                                {!errors.date_of_birth && (
                                    <p id="dob-help" className="text-xs text-foreground/60">
                                        Format : JJ/MM/AAAA
                                    </p>
                                )}

                                {touched.date_of_birth && errors.date_of_birth && (
                                    <p id="dob-error" className="text-xs text-red-500">
                                        {getErrorMessage("date_of_birth", errors.date_of_birth)}
                                    </p>
                                )}
                            </div>


                            {/* Adresse (optionnelle) */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="address">{copy.address || "Adresse"}</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder={lang === "en" ? "Your address" : "Votre adresse"}
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                                />
                            </div>

                            {/* Ville + Code postal */}
                            <div className="space-y-2 sm:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{copy.city || "Ville"}</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            placeholder={copy.placeholders?.city || "Paris"}
                                            value={formData.city || ""}
                                            onChange={(e) => handleChange("city", e.target.value)}
                                            onBlur={() => handleBlur("city")}
                                            required
                                            aria-invalid={!!errors.city}
                                            aria-describedby={errors.city ? "city-error" : undefined}
                                            className={touched.city && errors.city ? "border-red-500" : ""}
                                        />
                                        {touched.city && errors.city && (
                                            <p id="city-error" className="text-xs text-red-500">
                                                {getErrorMessage("city", errors.city)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">{copy.postal_code || "Code postal"}</Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            placeholder={copy.placeholders?.postal_code || "75001"}
                                            value={formData.postal_code || ""}
                                            onChange={(e) => handleChange("postal_code", e.target.value)}
                                            onBlur={() => handleBlur("postal_code")}
                                            required
                                            aria-invalid={!!errors.postal_code}
                                            aria-describedby={errors.postal_code ? "postal-code-error" : undefined}
                                            className={touched.postal_code && errors.postal_code ? "border-red-500" : ""}
                                        />
                                        {touched.postal_code && errors.postal_code && (
                                            <p id="postal-code-error" className="text-xs text-red-500">
                                                {getErrorMessage("postal_code", errors.postal_code)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========== STEP 2 ========== */}
                {workerStep === 2 && (
                    <div className="space-y-6">
                        {/* Toggle AE (switch right + OUI/NON) */}
                        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background/40 px-4 py-3">
                            <Label htmlFor="has_ae_status" className="text-sm sm:text-base font-medium">
                                {copy.has_ae_status || "Avez-vous le statut AE (auto-entrepreneur) ?"}
                            </Label>

                            <button
                                id="has_ae_status"
                                type="button"
                                role="switch"
                                aria-checked={!!formData.has_ae_status}
                                onClick={() => handleAEToggle(!formData.has_ae_status)}
                                className={`
                                          relative inline-flex h-10 w-28 items-center rounded-full border transition
                                          ${formData.has_ae_status ? "bg-emerald-500/20 border-emerald-500/30" : "bg-background/60 border-border"}
                                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                                        `}
                            >
                                {/* knob */}
                                <span
                                    className={`
                                                absolute top-1/2 -translate-y-1/2 h-8 w-12 rounded-full bg-background shadow-sm transition-transform
                                                ${formData.has_ae_status ? "translate-x-[60px]" : "translate-x-1"}
                                              `}
                                />

                                {/* labels */}
                                <span className="relative z-10 flex w-full items-center justify-between px-3 text-xs font-semibold">
                                  <span className={formData.has_ae_status ? "text-foreground/40" : "text-foreground"}>
                                    NON
                                  </span>
                                  <span className={formData.has_ae_status ? "text-foreground" : "text-foreground/40"}>
                                    OUI
                                  </span>
                                </span>
                            </button>
                        </div>


                        {/* Champs conditionnels AE */}
                        {formData.has_ae_status && (
                            <div className="space-y-5 border-l-2 border-primary/30 pl-4 ml-2">
                                {/* SIRET */}
                                <div className="space-y-2">
                                    <Label htmlFor="siret">SIRET</Label>
                                    <Input
                                        id="siret"
                                        type="text"
                                        placeholder="123 456 789 00012"
                                        value={formData.siret || ""}
                                        onChange={(e) => handleSiretChange(e.target.value)}
                                        onBlur={() => handleBlur("siret")}
                                        required
                                        aria-invalid={!!errors.siret}
                                        aria-describedby={errors.siret ? "siret-error" : undefined}
                                        className={touched.siret && errors.siret ? "border-red-500" : ""}
                                    />
                                    {touched.siret && errors.siret && (
                                        <p id="siret-error" className="text-xs text-red-500">
                                            {getErrorMessage("siret", errors.siret)}
                                        </p>
                                    )}
                                </div>

                                {/* Adresse de facturation */}
                                <div className="space-y-2">
                                    <Label htmlFor="billing_address">{copy.billing_address || "Adresse de facturation"}</Label>
                                    <Input
                                        id="billing_address"
                                        type="text"
                                        placeholder={lang === "en" ? "Billing address" : "Adresse de facturation"}
                                        value={formData.billing_address || ""}
                                        onChange={(e) => handleBillingAddressChange(e.target.value)}
                                        onBlur={() => handleBlur("billing_address")}
                                        disabled={formData.same_as_personal}
                                        required={!formData.same_as_personal}
                                        aria-invalid={!!errors.billing_address}
                                        aria-describedby={errors.billing_address ? "billing-address-error" : undefined}
                                        className={`${touched.billing_address && errors.billing_address ? "border-red-500" : ""} ${
                                            formData.same_as_personal ? "bg-muted/50" : ""
                                        }`}
                                    />
                                    {touched.billing_address && errors.billing_address && (
                                        <p id="billing-address-error" className="text-xs text-red-500">
                                            {getErrorMessage("billing_address", errors.billing_address)}
                                        </p>
                                    )}
                                </div>

                                {/* Ville + Code postal (facturation) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_city">{copy.billing_city || "Ville"}</Label>
                                        <Input
                                            id="billing_city"
                                            type="text"
                                            placeholder={copy.placeholders?.city || "Paris"}
                                            value={formData.billing_city || ""}
                                            onChange={(e) => handleBillingCityChange(e.target.value)}
                                            onBlur={() => handleBlur("billing_city")}
                                            disabled={formData.same_as_personal}
                                            required={!formData.same_as_personal}
                                            aria-invalid={!!errors.billing_city}
                                            aria-describedby={errors.billing_city ? "billing-city-error" : undefined}
                                            className={`${touched.billing_city && errors.billing_city ? "border-red-500" : ""} ${
                                                formData.same_as_personal ? "bg-muted/50" : ""
                                            }`}
                                        />
                                        {touched.billing_city && errors.billing_city && (
                                            <p id="billing-city-error" className="text-xs text-red-500">
                                                {getErrorMessage("billing_city", errors.billing_city)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_postal_code">{copy.billing_postal_code || "Code postal"}</Label>
                                        <Input
                                            id="billing_postal_code"
                                            type="text"
                                            placeholder={copy.placeholders?.postal_code || "75001"}
                                            value={formData.billing_postal_code || ""}
                                            onChange={(e) => handleBillingPostalCodeChange(e.target.value)}
                                            onBlur={() => handleBlur("billing_postal_code")}
                                            disabled={formData.same_as_personal}
                                            required={!formData.same_as_personal}
                                            aria-invalid={!!errors.billing_postal_code}
                                            aria-describedby={errors.billing_postal_code ? "billing-postal-code-error" : undefined}
                                            className={`${touched.billing_postal_code && errors.billing_postal_code ? "border-red-500" : ""} ${
                                                formData.same_as_personal ? "bg-muted/50" : ""
                                            }`}
                                        />
                                        {touched.billing_postal_code && errors.billing_postal_code && (
                                            <p id="billing-postal-code-error" className="text-xs text-red-500">
                                                {getErrorMessage("billing_postal_code", errors.billing_postal_code)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Checkbox "Même que l'adresse personnelle" */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="same_as_personal"
                                        checked={formData.same_as_personal || false}
                                        onCheckedChange={(checked) => handleSameAsPersonalToggle(!!checked)}
                                    />
                                    <Label htmlFor="same_as_personal" className="text-sm">
                                        {copy.same_as_personal || "Même que l'adresse personnelle"}
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* CV (PDF) - toujours requis */}
                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="cv_pdf">CV (PDF)</Label>
                            <Input
                                id="cv_pdf"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleCvFileChange(e.target.files?.[0] || null)}
                                onBlur={() => handleBlur("cv_pdf")}
                                required
                                aria-invalid={!!errors.cv_pdf}
                                aria-describedby={errors.cv_pdf ? "cv-pdf-error" : undefined}
                                className={touched.cv_pdf && errors.cv_pdf ? "border-red-500" : ""}
                            />
                            {touched.cv_pdf && errors.cv_pdf && (
                                <p id="cv-pdf-error" className="text-xs text-red-500">
                                    {getErrorMessage("cv_pdf", errors.cv_pdf)}
                                </p>
                            )}
                            <p className="text-xs text-foreground/60">
                                {lang === "en" ? "PDF file only." : "Fichier PDF uniquement."}
                            </p>
                        </div>
                    </div>
                )}

                {/* ========== BOUTONS DE NAVIGATION ========== */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                    {/* Compétences (Skills) - Ajouté pour corriger la visibilité des missions */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base font-bold">
                                            {lang === "en" ? "My Skills / Roles" : "Mes Métiers / Compétences"}
                                        </Label>
                                        <p className="text-xs text-foreground/60 mb-4">
                                            {lang === "en" 
                                                ? "Select at least one role to see available missions." 
                                                : "Sélectionnez au moins un métier pour voir les missions disponibles."}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(SERVICE_TYPES || [
                                                { id: 'reception', label: 'Réception', icon: '🛎️' },
                                                { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
                                                { id: 'maintenance', label: 'Maintenance', icon: '🛠️' },
                                                { id: 'restaurant', label: 'Restauration', icon: '🍽️' }
                                            ]).map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => handleSkillToggle(s.id)}
                                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                                                        (formData.skills || []).includes(s.id)
                                                            ? "bg-brand/10 border-brand text-brand shadow-sm"
                                                            : "bg-background border-border text-muted-foreground hover:border-brand/30"
                                                    }`}
                                                >
                                                    <span className="text-2xl">{s.icon}</span>
                                                    <span className="text-xs font-bold text-center">{s.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {workerStep === 1 ? (
                        <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1">
                            {copy.back}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setWorkerStep((s) => Math.max(1, s - 1))}
                            className="sm:flex-1"
                        >
                            {workerPrevLabel}
                        </Button>
                    )}

                    {workerStep < workerTotalSteps ? (
                        <Button
                            type="button"
                            disabled={isNextDisabled}
                            onClick={() => setWorkerStep((s) => Math.min(workerTotalSteps, s + 1))}
                            className="sm:flex-1"
                        >
                            {workerNextLabel}
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading || !isStep2Valid} className="sm:flex-1">
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    {lang === "en" ? "Creating..." : "Création..."}
                                </span>
                            ) : (
                                copy.submit
                            )}
                        </Button>
                    )}
                </div>

                <p className="pt-2 text-center text-sm text-foreground/70">
                    {copy.hasAccount}{" "}
                    <Link to="/login" className="font-semibold text-blue-400 hover:underline">
                        {copy.login}
                    </Link>
                </p>
            </form>
        </div>
    );
}