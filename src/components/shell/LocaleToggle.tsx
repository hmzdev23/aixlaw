"use client";

import { useLocale } from "@/contexts/LocaleContext";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "fr" : "en")}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
      style={{
        borderColor: "var(--color-gray-200)",
        color: "var(--color-gray-600)",
      }}
      aria-label={locale === "en" ? "Switch to French" : "Passer en anglais"}
    >
      <span className={locale === "en" ? "font-semibold" : ""} style={{ color: locale === "en" ? "var(--color-brand)" : undefined }}>EN</span>
      <span style={{ color: "var(--color-gray-300, #D1D1D1)" }}>/</span>
      <span className={locale === "fr" ? "font-semibold" : ""} style={{ color: locale === "fr" ? "var(--color-brand)" : undefined }}>FR</span>
    </button>
  );
}
