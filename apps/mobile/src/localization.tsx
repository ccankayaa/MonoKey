import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import * as SecureStore from "expo-secure-store";

const messages = {
  en: {
    currency: "Currency",
    renewal: "Renewal (YYYY-MM-DD)",
    interval: "Interval",
    intervalCount: "Interval count",
    status: "Status",
    conflict: "Changed elsewhere. Reload before retrying.",
    search: "Search vault",
    username: "Username",
    url: "Website",
    notes: "Notes",
    favorite: "Favorite",
    changeMaster: "Change vault master passphrase",
    exportVault: "Export vault (plaintext share)",
    monthlyCost: "Monthly costs",
    activeCount: "Active subscriptions",
    upcoming: "Upcoming renewals",
    membership: "Membership",
    checkoutUnavailable: "Paid checkout is not configured.",
    profile: "Profile name",
    currentPassword: "Current login password",
    newEmail: "New email",
    newPassword: "New login password",
    resetPassword: "Reset login password",
    verifyEmail: "Verify new email",
    providerUnavailable: "Native provider registration is required. Email sign-in remains available.",
    save: "Save",
    appearance: "Appearance",
    system: "System",
    light: "Light",
    dark: "Dark",
    linkedCredential: "Link vault credential",
    unlockToLink: "Unlock the vault to link credentials.",
    partialSaved: "Subscription saved. Retry to complete the credential link.",

    overview: "Overview", subscriptions: "Subscriptions", vault: "Vault", settings: "Settings",
    welcome: "Subscriptions and an encrypted vault in separate security contexts.", email: "Email", password: "Password",
    signIn: "Sign in", signUp: "Create account", apple: "Continue with Apple", authFailed: "Authentication failed. Check your details and try again.",
    calmControl: "Calm Control", overviewBody: "Open Subscriptions for live recurring costs. Vault details remain hidden until you explicitly unlock it.",
    serviceName: "Service name", amount: "Amount", addSubscription: "Add subscription", offlineCache: "Offline cache is shown.", saveFailed: "Subscription could not be saved.",
    appearanceLanguage: "Appearance and language", followsDevice: "The app follows the device appearance.", language: "Language", signOut: "Sign out",
    recoveryCode: "Recovery code", recoveryWarning: "Save this once. MonoKey cannot recover it.", recoveryConfirmed: "I saved it safely.", completeSetup: "Complete setup",
    setupVault: "Set up vault", masterPassphrase: "Master passphrase", createVault: "Create encrypted vault", longerPassphrase: "Use a longer passphrase.",
    vaultLocked: "Vault locked", lockedPrivacy: "No service name or username is visible while locked.", unlock: "Unlock", unlockFailed: "Vault could not be unlocked.",
    lock: "Lock", title: "Title", generatePassword: "Generate password", addEncryptedRecord: "Add encrypted record", sessionOnly: "Password is available only in this unlocked session.",
    edit: "Edit", delete: "Delete", cancel: "Cancel", deleteConfirm: "Delete this encrypted record?",
  },
  tr: {
    currency: "Para birimi",
    renewal: "Yenilenme (YYYY-AA-GG)",
    interval: "Dönem",
    intervalCount: "Dönem sayısı",
    status: "Durum",
    conflict: "Başka bir yerde değiştirildi. Yenileyip tekrar deneyin.",
    search: "Kasada ara",
    username: "Kullanıcı adı",
    url: "Web sitesi",
    notes: "Notlar",
    favorite: "Favori",
    changeMaster: "Kasa ana parolasını değiştir",
    exportVault: "Kasayı dışa aktar (açık metin paylaşımı)",
    monthlyCost: "Aylık giderler",
    activeCount: "Aktif abonelikler",
    upcoming: "Yaklaşan yenilenmeler",
    membership: "Üyelik",
    checkoutUnavailable: "Ücretli ödeme henüz yapılandırılmadı.",
    profile: "Profil adı",
    currentPassword: "Mevcut giriş parolası",
    newEmail: "Yeni e-posta",
    newPassword: "Yeni giriş parolası",
    resetPassword: "Giriş parolasını sıfırla",
    verifyEmail: "Yeni e-postayı doğrula",
    providerUnavailable: "Yerel sağlayıcı kaydı gerekiyor. E-posta girişi kullanılabilir.",
    save: "Kaydet",
    appearance: "Görünüm",
    system: "Sistem",
    light: "Açık",
    dark: "Koyu",
    linkedCredential: "Kasa kaydını bağla",
    unlockToLink: "Kayıt bağlamak için kasanın kilidini açın.",
    partialSaved: "Abonelik kaydedildi. Kasa bağlantısı için tekrar deneyin.",

    overview: "Genel Bakış", subscriptions: "Abonelikler", vault: "Kasa", settings: "Ayarlar",
    welcome: "Abonelikler ve şifreli kasa ayrı güvenlik bağlamlarında tutulur.", email: "E-posta", password: "Parola",
    signIn: "Giriş yap", signUp: "Hesap oluştur", apple: "Apple ile devam et", authFailed: "Kimlik doğrulama başarısız. Bilgilerinizi denetleyip yeniden deneyin.",
    calmControl: "Sakin Kontrol", overviewBody: "Gerçek yinelenen giderler için Abonelikler'i açın. Kasa ayrıntıları siz açana kadar gizli kalır.",
    serviceName: "Servis adı", amount: "Tutar", addSubscription: "Abonelik ekle", offlineCache: "Çevrimdışı önbellek gösteriliyor.", saveFailed: "Abonelik kaydedilemedi.",
    appearanceLanguage: "Görünüm ve dil", followsDevice: "Uygulama cihaz görünümünü izler.", language: "Dil", signOut: "Çıkış yap",
    recoveryCode: "Kurtarma kodu", recoveryWarning: "Bunu yalnızca bir kez güvenli yere kaydedin. MonoKey geri getiremez.", recoveryConfirmed: "Güvenli şekilde kaydettim.", completeSetup: "Kurulumu tamamla",
    setupVault: "Kasayı kur", masterPassphrase: "Kasa ana parolası", createVault: "Şifreli kasa oluştur", longerPassphrase: "Daha uzun bir ana parola kullanın.",
    vaultLocked: "Kasa kilitli", lockedPrivacy: "Kilitliyken servis adı veya kullanıcı adı gösterilmez.", unlock: "Kilidi aç", unlockFailed: "Kasanın kilidi açılamadı.",
    lock: "Kilitle", title: "Başlık", generatePassword: "Parola üret", addEncryptedRecord: "Şifreli kayıt ekle", sessionOnly: "Parola yalnızca bu açık oturumda kullanılabilir.",
    edit: "Düzenle", delete: "Sil", cancel: "Vazgeç", deleteConfirm: "Bu şifreli kayıt silinsin mi?",
  },
} as const;

type Locale = keyof typeof messages;
type MessageKey = keyof typeof messages.en;
interface LocalizationValue { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string }

const LocalizationContext = createContext<LocalizationValue | null>(null);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [locale, setValue] = useState<Locale>("tr");
  useEffect(() => { void SecureStore.getItemAsync("monokey.locale").then(value => { if (value === "en" || value === "tr") setValue(value); }); }, []);
  const setLocale = (value: Locale): void => { setValue(value); void SecureStore.setItemAsync("monokey.locale", value); };
  const value = useMemo<LocalizationValue>(() => ({ locale, setLocale, t: key => messages[locale][key] }), [locale]);
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization(): LocalizationValue {
  const value = useContext(LocalizationContext);
  if (!value) throw new Error("LocalizationProvider is missing.");
  return value;
}
