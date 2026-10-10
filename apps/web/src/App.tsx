import { EmailActionPage } from "./features/auth/EmailActionPage";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { useAuth } from "./features/auth/AuthContext";
import { PasswordResetPage } from "./features/auth/PasswordResetPage";
import { AuthPage } from "./features/auth/AuthPage";
import { SettingsPage, ThemeEffect } from "./features/settings/SettingsPage";
import { useTranslation } from "./i18n/useTranslation";

import { VaultSessionProvider } from "./features/vault/VaultSession";
import { MembershipPage } from "./features/membership/MembershipPage";

const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage").then(module => ({ default: module.DashboardPage })));
const SubscriptionsPage = lazy(() => import("./features/subscriptions/SubscriptionsPage").then(module => ({ default: module.SubscriptionsPage })));
const VaultPage = lazy(() => import("./features/vault/VaultPage").then(module => ({ default: module.VaultPage })));

export function App() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (location.pathname === "/auth/reset" || new URLSearchParams(location.search).get("mode") === "resetPassword") return <><ThemeEffect /><PasswordResetPage /></>;
  if (location.pathname === "/auth/action" || new URLSearchParams(location.search).has("mode")) return <><ThemeEffect /><EmailActionPage /></>;
  if (loading) return <main className="auth-page" role="status">{t("loading")}</main>;
  if (!user) return <><ThemeEffect /><AuthPage /></>;
  return <VaultSessionProvider key={user.uid}><BrowserRouter><ThemeEffect /><Suspense fallback={<p role="status">{t("loading")}</p>}><Routes><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="subscriptions" element={<SubscriptionsPage />} /><Route path="vault" element={<VaultPage />} /><Route path="membership" element={<MembershipPage />} /><Route path="settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></Suspense></BrowserRouter></VaultSessionProvider>;
}
