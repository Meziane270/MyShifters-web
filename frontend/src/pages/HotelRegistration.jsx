import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

// ====================================================
// FONCTIONS DE VALIDATION
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

const validateHotelName = (name) => {
    if (!name || name.trim() === "") return "required";
    return null;
};

const validateCity = (city) => {
    if (!city || city.trim() === "") return "required";
    return null;
};

const validatePostalCode = (code) => {
    if (!code || code.trim() === "") return null;
    const regex = /^[0-9]{5}$/;
    return regex.test(code) ? null : "format";
};

// ====================================================
// OBJET VALIDATEURS
// ====================================================
const validators = {
    first_name: validateFirstName,
    last_name: validateLastName,
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    hotel_name: validateHotelName,
    city: validateCity,
    postal_code: validatePostalCode,
};

export default function HotelRegistration({
                                              formData,
                                              setFormData,
                                              loading,
                                              showPassword,
                                              toggleShowPassword,
                                              copy,
                                              lang,
                                              onSubmit,
                                              onBack,
                                          }) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const getFieldError = (field, value, password) => {
        const validator = validators[field];
        if (!validator) return null;
        if (field === "confirmPassword") {
            return validator(value, password);
        }
        return validator(value);
    };

    const isFormValid = useMemo(() => {
        const fields = [
            { field: "first_name", value: formData.first_name },
            { field: "last_name", value: formData.last_name },
            { field: "email", value: formData.email },
            { field: "phone", value: formData.phone },
            { field: "password", value: formData.password },
            {
                field: "confirmPassword",
                value: formData.confirmPassword,
                extra: formData.password,
            },
            { field: "hotel_name", value: formData.hotel_name },
            { field: "city", value: formData.city },
            { field: "postal_code", value: formData.postal_code },
        ];
        return fields.every(({ field, value, extra }) => {
            const error = getFieldError(field, value, extra);
            return error === null;
        });
    }, [
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword,
        formData.hotel_name,
        formData.city,
        formData.postal_code,
    ]);

    const getErrorMessage = (field, errorCode) => {
        if (!errorCode) return null;
        const key = `validation.${field}.${errorCode}`;
        return copy[key] || `${field} error: ${errorCode}`;
    };

    const handleChange = (field, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };

            setErrors((prevErrors) => {
                const next = {
                    ...prevErrors,
                    [field]: getFieldError(field, value, updated.password),
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
                        <span className="opacity-90 dark:opacity-80">{copy.formTitleHotel}</span>
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                        {copy.formTitleHotel}
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

            <form
                onSubmit={onSubmit}
                className="mt-7 space-y-5"
                data-testid="register-form"
                noValidate
            >
                {/* Contact fields (first name + last name) */}
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

                    {/* Password + Confirm Password on same row */}
                    <div className="space-y-2 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                                        aria-label={
                                            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                                        }
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {touched.password && errors.password && (
                                    <p id="password-error" className="text-xs text-red-500">
                                        {getErrorMessage("password", errors.password)}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    {copy.confirmPassword || "Confirmer le mot de passe"}
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={copy.placeholders?.confirmPassword || "••••••••"}
                                        value={formData.confirmPassword || ""}
                                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                        onBlur={() => handleBlur("confirmPassword")}
                                        required
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.confirmPassword}
                                        aria-describedby={
                                            errors.confirmPassword ? "confirm-password-error" : undefined
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
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
                                        {getErrorMessage("confirmPassword", errors.confirmPassword)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hotel specific fields */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="hotel_name">{copy.hotel_name}</Label>
                        <Input
                            id="hotel_name"
                            type="text"
                            placeholder={copy.placeholders.hotel_name}
                            value={formData.hotel_name || ""}
                            onChange={(e) => handleChange("hotel_name", e.target.value)}
                            onBlur={() => handleBlur("hotel_name")}
                            required
                            aria-invalid={!!errors.hotel_name}
                            aria-describedby={errors.hotel_name ? "hotel-name-error" : undefined}
                            className={touched.hotel_name && errors.hotel_name ? "border-red-500" : ""}
                        />
                        {touched.hotel_name && errors.hotel_name && (
                            <p id="hotel-name-error" className="text-xs text-red-500">
                                {getErrorMessage("hotel_name", errors.hotel_name)}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="hotel_address">{copy.hotel_address}</Label>
                        <Input
                            id="hotel_address"
                            type="text"
                            placeholder={copy.placeholders.hotel_address}
                            value={formData.hotel_address || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, hotel_address: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">{copy.city}</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    placeholder={copy.placeholders.city}
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

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1">
                        {copy.back}
                    </Button>
                    <Button type="submit" disabled={loading || !isFormValid} className="sm:flex-1">
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {lang === "en" ? "Creating..." : "Création..."}
                            </span>
                        ) : (
                            copy.submit
                        )}
                    </Button>
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