import { findBrand } from "@monokey/contracts";
export function serviceManagementUrl(name: string): string | null { const service=findBrand(name); return service?.domains[0] ? `https://${service.domains[0]}/` : null; }
export function ServiceLogo({ name }: { name: string }) {
 const service=findBrand(name);
 return <span className="service-logo custom" aria-label={service?.name.en ?? name}>{service?.asset ? <img loading="lazy" src={`/brands/${service.asset}`} alt="" /> : <span aria-hidden="true">{name.charAt(0).toUpperCase() || "◇"}</span>}</span>;
}
