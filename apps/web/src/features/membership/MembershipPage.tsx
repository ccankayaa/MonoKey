import { useState } from "react";
import { apiClient, useMembershipQuery, usePlansQuery } from "../../app/api";
import { useTranslation } from "../../i18n/useTranslation";
export function MembershipPage() {
  const { t } = useTranslation();
  const membership = useMembershipQuery(undefined); const plans = usePlansQuery(undefined);
  const [error, setError] = useState(false);
  async function checkout(): Promise<void> {
    try { const result = await apiClient.createCheckout(); const url = new URL(result.url); if (url.origin !== "https://checkout.stripe.com") throw new Error("Invalid checkout origin"); location.assign(url.href); }
    catch { setError(true); }
  }
  return <><header className="page-header"><h1>{t("membership")}</h1></header>
    {membership.isLoading && <p role="status">{t("loading")}</p>}
    {(membership.isError || plans.isError || error) && <p role="alert" className="error">{t("errorGeneric")}</p>}
    <p>{t("currentPlan")}: {membership.data?.plan ?? "—"}</p><p className="muted">{t("membershipPrivacy")}</p>
    <section className="subscription-grid">{plans.data?.map(plan => <article className="card" key={plan.id}><h2>{plan.id}</h2><p>{plan.displayPrice ?? t("priceNotConfigured")}</p><p>{t("subscriptionLimit")}: {plan.subscriptionLimit ?? t("unlimited")}</p><p>{t("vaultLimit")}: {plan.vaultRecordLimit ?? t("unlimited")}</p>
      {plan.id === "Pro" && <><button className="button" disabled={!membership.data?.checkoutAvailable || membership.data.plan === "Pro"} onClick={() => void checkout()}>{t("upgrade")}</button>{!membership.data?.checkoutAvailable && <p>{t("billingUnavailable")}</p>}</>}
    </article>)}</section></>;
}
