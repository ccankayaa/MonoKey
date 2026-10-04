import { useState } from "react";
import { Button, Platform, Text, TextInput, View } from "react-native";
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, signInWithApple } from "../services/firebase";
import { Screen } from "../components/Screen";
import { useUi } from "../components/ui";
import { useLocalization } from "../localization";

export function AuthScreen() { const ui = useUi();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  const { t } = useLocalization();
  async function authenticate(create: boolean): Promise<void> {
    try { setError(""); if (create) await createUserWithEmailAndPassword(auth, email, password); else await signInWithEmailAndPassword(auth, email, password); }
    catch { setError(t("authFailed")); }
  }
  return <Screen><Text accessibilityRole="header" style={ui.title}>Mono Key</Text><Text style={ui.body}>{t("welcome")}</Text><View style={ui.card}><TextInput accessibilityLabel={t("email")} autoCapitalize="none" autoComplete="email" keyboardType="email-address" style={ui.input} value={email} onChangeText={setEmail} placeholder={t("email")} /><TextInput accessibilityLabel={t("password")} autoComplete="password" secureTextEntry style={ui.input} value={password} onChangeText={setPassword} placeholder={t("password")} />{error ? <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text> : <Button title={t("apple")} disabled />}<Button title={t("signIn")} onPress={() => void authenticate(false)} /><Button title={t("signUp")} onPress={() => void authenticate(true)} /><Button title={t("resetPassword")} disabled={!email} onPress={() => void sendPasswordResetEmail(auth,email).catch(() => setError(t("authFailed")))} /><Text style={ui.body}>{t("providerUnavailable")}</Text><Button title="Google" disabled />{Platform.OS === "ios" && process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === "true" ? <Button title={t("apple")} onPress={() => void signInWithApple().catch(() => setError(t("authFailed")))} /> : <Button title={t("apple")} disabled />}</View></Screen>;
}
