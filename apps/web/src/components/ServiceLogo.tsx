const catalogue = [
  { match: /netflix/i, id: "netflix", url: "https://www.netflix.com/YourAccount" },
  { match: /spotify/i, id: "spotify", url: "https://www.spotify.com/account/" },
  { match: /chatgpt|openai/i, id: "openai", url: "https://chatgpt.com/" },
  { match: /adobe/i, id: "adobe", url: "https://account.adobe.com/plans" },
] as const;
export function serviceManagementUrl(name: string): string | null { return catalogue.find(service => service.match.test(name))?.url ?? null; }
export function ServiceLogo({ name }: { name: string }) {
  const service = catalogue.find(item => item.match.test(name));
  return <span className={`service-logo ${service?.id ?? "custom"}`}>{service ? <img src={`/services/${service.id}.svg`} alt="" /> : <span aria-hidden="true">{name.charAt(0).toUpperCase() || "◇"}</span>}</span>;
}
