import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { CostSummary, Subscription, Membership } from "@monokey/contracts";
import { Screen } from "../components/Screen";
import { useUi } from "../components/ui";
import { useLocalization } from "../localization";
import { api } from "../services/api";
import { useVaultSession } from "../services/VaultSession";
export function DashboardScreen() {
 const ui = useUi(); const {t, locale} = useLocalization(); const session = useVaultSession();
 const [data, setData] = useState<{costs: CostSummary[]; active: number; upcoming: Subscription[]; membership: Membership; remindersEnabled: boolean} | null>(null); const [error,setError] = useState("");
 useEffect(() => { let active = true; void Promise.all([api.getCostSummary(), api.listSubscriptions(), api.getNotificationPreference().then(async preference=>({enabled:preference?.renewalRemindersEnabled??true,items:preference?.renewalRemindersEnabled===false?[]:await api.getUpcoming(preference?.daysBeforeRenewal??7)})), api.getMembership()]).then(([costs,items,upcoming,membership]) => {if (active) setData({costs,active:items.items.filter(item => item.status === "Active").length,upcoming:upcoming.items,membership,remindersEnabled:upcoming.enabled});}).catch(() => {if (active) setError(t("saveFailed"));}); return () => {active=false;}; }, [t]);
 return <Screen><Text accessibilityRole="header" style={ui.title}>Mono Key</Text>{error ? <Text style={ui.error}>{error}</Text> : null}<View style={ui.card}><Text style={ui.heading}>{t("monthlyCost")}</Text>{data?.costs.map(item => <Text key={item.currencyCode} style={ui.body}>{new Intl.NumberFormat(locale,{style:"currency",currency:item.currencyCode}).format(item.monthlyCost)}</Text>)}</View><View style={ui.card}><Text style={ui.heading}>{t("activeCount")}</Text><Text style={ui.title}>{data?.active ?? "—"}</Text><Text style={ui.body}>{t("membership")}: {data?.membership.plan ?? "—"}</Text></View><View style={ui.card}><Text style={ui.heading}>{t("upcoming")}</Text>{data && !data.remindersEnabled && <Text style={ui.body}>{t("remindersDisabled")}</Text>}{data?.upcoming.map(item => <Text key={item.id} style={ui.body}>{item.name} · {item.nextRenewalDate} · {item.amount} {item.currencyCode}</Text>)}</View><View style={ui.card}><Text style={ui.heading}>{t("vault")}</Text>{session.key ? session.records.filter(item => item.plaintext.favorite).map(item => <Text key={item.encrypted.id} style={ui.body}>{item.plaintext.title}</Text>) : <Text style={ui.body}>{t("lockedPrivacy")}</Text>}</View></Screen>;
}
