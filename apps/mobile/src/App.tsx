import { parseEmailActionLink, type EmailActionInput } from "@monokey/contracts";
import { environment } from "./services/environment";
import { EmailActionScreen } from "./screens/EmailActionScreen";
import { useNativeAutofillRequest, nativeAutofill } from "./services/nativeAutofill";
import { NativeAutofillPanel } from "./components/NativeAutofillPanel";
import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { onAuthStateChanged, type User } from "firebase/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { clearAccountCache } from "./services/offlineDatabase";
import { auth } from "./services/firebase";
import { AuthScreen } from "./screens/AuthScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { SubscriptionsScreen } from "./screens/SubscriptionsScreen";
import { VaultScreen } from "./screens/VaultScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ThemeProvider, useColors } from "./theme";
import { VaultSessionProvider } from "./services/VaultSession";
import { LocalizationProvider, useLocalization } from "./localization";

type Tab = "overview" | "subscriptions" | "vault" | "settings";
const tabs: Tab[] = ["overview", "subscriptions", "vault", "settings"];

function AppContent() {
  const colors = useColors();
  const autofillRequest=useNativeAutofillRequest();
  const [emailAction,setEmailAction]=useState<EmailActionInput|null>(null);
  useEffect(()=>{let active=true;const capture=(url:string)=>{const action=parseEmailActionLink(url,environment.environment);if(active&&action){setEmailAction(action);void nativeAutofill?.clearActionIntent?.().catch(()=>undefined);}};void Linking.getInitialURL().then(url=>{if(url)capture(url);});const listener=Linking.addEventListener("url",event=>capture(event.url));return()=>{active=false;listener.remove();};},[]);
  const [user, setUser] = useState<User | null>(auth.currentUser); const [ready, setReady] = useState(false); const [tab, setTab] = useState<Tab>("overview");
  const previous = useRef<string | null>(null);
  const { t } = useLocalization();
  useEffect(() => onAuthStateChanged(auth, value => { if (previous.current && previous.current !== value?.uid) void clearAccountCache(previous.current); if(!value)void nativeAutofill?.clearCiphertextSnapshot?.().catch(()=>undefined); previous.current = value?.uid ?? null; setUser(value); setReady(true); }), []);
  useEffect(() => { void (async () => { if (!await SecureStore.getItemAsync("vaultx.device-id")) await SecureStore.setItemAsync("vaultx.device-id", crypto.randomUUID()); })(); }, []);
  if(emailAction)return <SafeAreaProvider><EmailActionScreen action={emailAction} onClose={()=>setEmailAction(null)} /></SafeAreaProvider>;
  if (!ready) return null;
  if (!user) return <SafeAreaProvider><AuthScreen /></SafeAreaProvider>;
  const effectiveTab=autofillRequest?"vault":tab;
  const content = effectiveTab === "overview" ? <DashboardScreen /> : effectiveTab === "subscriptions" ? <SubscriptionsScreen /> : effectiveTab === "vault" ? <VaultScreen /> : <SettingsScreen />;
  return <SafeAreaProvider><VaultSessionProvider key={user.uid}><View style={styles.root}>{autofillRequest && <NativeAutofillPanel request={autofillRequest} />}{content}<View accessibilityRole="tablist" style={[styles.tabs, {borderColor: colors.border, backgroundColor: colors.surface}]}>{tabs.map(item => <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === item }} key={item} onPress={() => setTab(item)} style={styles.tab}><Text style={[styles.tabText, {color: tab === item ? colors.brand : colors.secondary}, tab === item && styles.active]}>{t(item)}</Text></Pressable>)}</View></View></VaultSessionProvider></SafeAreaProvider>;
}

export function App() { return <ThemeProvider><LocalizationProvider><AppContent /></LocalizationProvider></ThemeProvider>; }

const styles = StyleSheet.create({ root: { flex: 1 }, tabs: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", paddingBottom: 12, paddingTop: 8, borderTopWidth: 1, borderColor: "#334155", backgroundColor: "#1A2235" }, tab: { flex: 1, minHeight: 48, justifyContent: "center", alignItems: "center" }, tabText: { fontSize: 12 }, active: { fontWeight: "700" } });
