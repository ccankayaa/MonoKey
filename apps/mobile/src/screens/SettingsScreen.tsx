import { PasswordGenerator } from "../components/PasswordGenerator";
import { useVaultSession } from "../services/VaultSession";
import { nativeGoogle, nativeGoogleCredential, nativeGoogleReady } from "../services/nativeGoogle";
import { nativeAppleCredential } from "../services/firebase";
import { authenticationMessage, normalizeLoginEmail, mayUnlinkProvider } from "@monokey/contracts";
import { NativeAutofillSettings } from "../components/NativeAutofillSettings";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, signOut, updatePassword, verifyBeforeUpdateEmail, linkWithCredential, unlink } from "firebase/auth";
import type { Membership, Plan } from "@monokey/contracts";
import { Screen } from "../components/Screen";
import { useUi } from "../components/ui";
import { useTheme, type Appearance } from "../theme";
import { auth } from "../services/firebase";
import { api } from "../services/api";
import { useLocalization } from "../localization";
import { RenewalSettings } from "../components/RenewalSettings";
export function SettingsScreen() {
 const session=useVaultSession(); const ui=useUi(); const {locale,setLocale,t}=useLocalization();const theme=useTheme();const user=auth.currentUser!; const [name,setName]=useState(""); const [currentPassword,setCurrentPassword]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");const [membership,setMembership]=useState<Membership | null>(null); const [plans,setPlans]=useState<Plan[]>([]);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;void Promise.all([api.getProfile(),api.getMembership(),api.getPlans()]).then(([profile,membership,plans])=>{if(active){setName(profile.displayName??"");setMembership(membership);setPlans(plans);}}).catch(()=>{if(active)setMessage(t("saveFailed"));});return()=>{active=false;};},[t]);
 async function action(work:()=>Promise<unknown>,reauth=false):Promise<void> {
  if(busy)return;setBusy(true);setMessage("");
  try{if(reauth){session.lock();
   if(user.providerData.some(p=>p.providerId==="password") && user.email)await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,currentPassword));
   else if(user.providerData.some(p=>p.providerId==="google.com") && nativeGoogleReady)await reauthenticateWithCredential(user,await nativeGoogleCredential());
   else if(user.providerData.some(p=>p.providerId==="apple.com") && process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN==="true")await reauthenticateWithCredential(user,await nativeAppleCredential());
   else throw {code:"auth/operation-not-allowed"};
  }if(auth.currentUser?.uid!==user.uid)throw {code:"auth/invalid-credential"};await work();await user.reload();await user.getIdToken(true);setMessage(t("save"));}
  catch(e){setMessage(authenticationMessage(e,locale));}
  finally{setCurrentPassword("");setPassword("");setBusy(false);}
 }

 return <Screen><Text style={ui.title}>{t("settings")}</Text><View style={ui.card}><Text style={ui.heading}>{t("appearanceLanguage")}</Text><View style={ui.row}><Button title="Türkçe" disabled={locale==="tr"} onPress={()=>setLocale("tr")}/><Button title="English" disabled={locale==="en"} onPress={()=>setLocale("en")}/></View><View style={ui.row}>{(["system","light","dark"] as Appearance[]).map(value=><Button key={value} title={t(value)} disabled={theme.appearance===value} onPress={()=>theme.setAppearance(value)}/>)}</View></View>
 <RenewalSettings/><View style={ui.card}><Text style={ui.heading}>{t("membership")}: {membership?.plan??"—"}</Text>{plans.map(plan=><Text key={plan.id} style={ui.body}>{plan.id} · {plan.displayPrice??"—"}</Text>)}<Text style={ui.body}>{t("checkoutUnavailable")}</Text></View>
 <View style={ui.card}><Text style={ui.heading}>{user.email}</Text><TextInput accessibilityLabel={t("profile")} style={ui.input} value={name} onChangeText={setName}/><Button title={t("save")} disabled={busy} onPress={()=>void action(()=>api.updateProfile(name))}/><TextInput accessibilityLabel={t("currentPassword")} style={ui.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder={t("currentPassword")}/><TextInput accessibilityLabel={t("newEmail")} style={ui.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder={t("newEmail")}/><Button title={t("verifyEmail")} disabled={busy||!email} onPress={()=>void action(()=>verifyBeforeUpdateEmail(user,normalizeLoginEmail(email)),true)}/><TextInput accessibilityLabel={t("newPassword")} autoComplete="new-password" textContentType="newPassword" style={ui.input} secureTextEntry value={password} onChangeText={setPassword} placeholder={t("newPassword")}/><PasswordGenerator onUse={setPassword} /><Button title={t("newPassword")} disabled={busy||password.length<6} onPress={()=>void action(async()=>{if(!user.email || !user.emailVerified&&!user.providerData.some(p=>p.providerId==="password"))throw {code:"auth/unverified-email"};await updatePassword(user,password);},true)}/><Button title={t("resetPassword")} disabled={busy||!user.email} onPress={()=>void action(()=>sendPasswordResetEmail(auth,user.email!))}/>
 {user.providerData.map(provider=><View key={provider.providerId} style={ui.row}><Text style={ui.body}>{provider.providerId}</Text><Button title={t("delete")} disabled={busy||!mayUnlinkProvider(user.providerData.map(p=>p.providerId),provider.providerId,user.emailVerified)} onPress={()=>void action(async()=>{if(!mayUnlinkProvider(user.providerData.map(p=>p.providerId),provider.providerId,user.emailVerified))throw {code:"auth/last-provider"};await unlink(user,provider.providerId);},true)}/></View>)}<Text style={ui.body}>{t("providerUnavailable")}</Text><Button title="Google" disabled={busy||!nativeGoogleReady||user.providerData.some(p=>p.providerId==="google.com")} onPress={()=>void action(async()=>linkWithCredential(user,await nativeGoogleCredential()),true)}/><Button title="Apple" disabled={busy||process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN!=="true"||user.providerData.some(p=>p.providerId==="apple.com")} onPress={()=>void action(async()=>linkWithCredential(user,await nativeAppleCredential()),true)}/>{message?<Text accessibilityLiveRegion="polite" style={ui.body}>{message}</Text>:null}<Button title={t("signOut")} onPress={()=>{session.lock();void signOut(auth).then(()=>nativeGoogle?.GoogleSignin.signOut()).catch(()=>setMessage(t("authFailed")));}}/></View><NativeAutofillSettings /></Screen>;
}
