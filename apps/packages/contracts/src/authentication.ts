export type AuthOperation = "register" | "login" | "google" | "apple" | "reset-send" | "reset-verify" | "reset-confirm";

export function normalizeLoginEmail(value: unknown): string {
  if (typeof value !== "string") throw { code: "auth/invalid-email" };
  const email = value.trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw { code: "auth/invalid-email" };
  return email;
}

const errors = {
  invalidEmail: ["Geçerli bir e-posta adresi girin.", "Enter a valid email address."],
  weakPassword: ["Daha güçlü bir giriş parolası seçin (en az 6 karakter).", "Choose a stronger sign-in password (at least 6 characters)."],
  cancelled: ["Giriş penceresi kapatıldı. Tekrar deneyebilirsiniz.", "The sign-in window was closed. You can try again."],
  blocked: ["Tarayıcı giriş penceresini engelledi. Bu site için açılır pencerelere izin verin.", "Allow popups for this site, then try again."],
  domain: ["Bu alan adı giriş için yetkilendirilmemiş. Site yöneticisi Firebase yetkili alanlarını kontrol etmeli.", "This domain is not authorized. The operator must check Firebase authorized domains."],
  network: ["Kimlik hizmetine ulaşılamadı. Bağlantınızı ve tarayıcı engellemelerini kontrol edin.", "Cannot reach the identity service. Check connectivity and browser blocking."],
  configuration: ["Giriş hizmeti yapılandırması geçersiz. Site yöneticisi Firebase projesini, sağlayıcıyı ve istemci ayarlarını kontrol etmeli.", "Sign-in configuration is invalid. The operator must check the Firebase project, provider and client configuration."],
  resetCode: ["Bu sıfırlama bağlantısı geçersiz, süresi dolmuş veya kullanılmış. Yeni bağlantı isteyin.", "This reset link is invalid, expired or already used. Request a new link."],
  credentials: ["Giriş tamamlanamadı. Bilgilerinizi kontrol edin veya parola sıfırlama bağlantısı isteyin.", "Sign-in could not be completed. Check your details or request a password reset link."],
  throttled: ["Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.", "Too many attempts. Please try again later."],
} as const;

export function safeAuthCode(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  return typeof code === "string" && /^auth\/[a-z-]{1,80}$/.test(code) ? code : "auth/unknown";
}
export function authenticationMessage(error: unknown, locale: "tr" | "en"): string {
  const code = safeAuthCode(error);
  const key: keyof typeof errors = code === "auth/invalid-email" ? "invalidEmail"
    : ["auth/weak-password", "auth/missing-password", "auth/password-does-not-meet-requirements"].includes(code) ? "weakPassword"
    : ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(code) ? "cancelled"
    : code === "auth/popup-blocked" ? "blocked"
    : code === "auth/unauthorized-domain" ? "domain"
    : code === "auth/network-request-failed" ? "network"
    : ["auth/invalid-api-key", "auth/app-not-authorized", "auth/operation-not-allowed", "auth/invalid-oauth-client-id", "auth/configuration-not-found"].includes(code) ? "configuration"
    : ["auth/invalid-action-code", "auth/expired-action-code"].includes(code) ? "resetCode"
    : code === "auth/too-many-requests" ? "throttled" : "credentials";
  return errors[key][locale === "tr" ? 0 : 1];
}

export function mayUnlinkProvider(providers: readonly string[], provider: string, emailVerified: boolean): boolean {
  return providers.includes(provider) && providers.some(value => value !== provider &&
    (value === "google.com" || value === "apple.com" || value === "password" && emailVerified));
}
