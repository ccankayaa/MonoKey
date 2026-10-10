import { useId, useState } from "react";
import { searchBrands, type Brand } from "@monokey/contracts";
import { ServiceLogo } from "./ServiceLogo";
import { useTranslation } from "../i18n/useTranslation";
const categories=["video","music","shopping","social","productivity","telecom","banking","government","ai","games"];
export function BrandPicker({ onSelect }: { onSelect: (brand: Brand) => void }) {
 const {locale}=useTranslation(); const id=useId(); const [query,setQuery]=useState(""); const [category,setCategory]=useState(""); const [open,setOpen]=useState(false);
 const results=open?searchBrands(query,category).slice(0,24):[];
 return <div className="brand-picker"><button type="button" className="auth-link" aria-expanded={open} onClick={()=>setOpen(!open)}>{locale==="tr"?"Servis kataloğundan seç":"Choose from service catalog"}</button>{open && <fieldset className="form"><legend>{locale==="tr"?"Servis kataloğu":"Service catalog"}</legend><label htmlFor={id}>{locale==="tr"?"Servis ara":"Find a service"}</label><input id={id} type="search" value={query} onChange={e=>setQuery(e.target.value)} /><select aria-label={locale==="tr"?"Katalog kategorisi":"Catalog category"} value={category} onChange={e=>setCategory(e.target.value)}><option value="">{locale==="tr"?"Tüm kategoriler":"All categories"}</option>{categories.map(value=><option key={value} value={value}>{value}</option>)}</select><div className="brand-results">{results.map(brand=><button key={brand.id} type="button" className="button secondary" onClick={()=>{onSelect(brand);setOpen(false);setQuery("");}}><ServiceLogo name={brand.name[locale]} />{brand.name[locale]}</button>)}</div><small>{locale==="tr"?"İlk 24 sonuç gösterilir; aramanızı daraltabilirsiniz.":"Showing up to 24 matches; refine your search."}</small></fieldset>}</div>;
}
