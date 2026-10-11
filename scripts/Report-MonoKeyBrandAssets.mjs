import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=readFileSync(resolve(root,"apps/packages/contracts/src/brandCatalog.ts"),"utf8");
const catalog=JSON.parse(source.slice(source.indexOf("= [")+2,source.indexOf("\n];")+2));
const assets=resolve(root,"apps/packages/contracts/assets/brands");
const native=readFileSync(resolve(root,"apps/mobile/src/components/brandImages.ts"),"utf8");
const missing=[],broken=[];
for(const brand of catalog){
 if(!brand.asset){missing.push(brand.id);continue;}
 if(!/^[a-zA-Z0-9-]+\.(svg|png)$/u.test(brand.asset) || !existsSync(resolve(assets,brand.asset)) || !existsSync(resolve(assets,basename(brand.asset,extname(brand.asset))+".png")) || !native.includes('"'+basename(brand.asset,extname(brand.asset))+'"'))broken.push(brand.id);
 if(extname(brand.asset)===".svg"){
  const svg=readFileSync(resolve(assets,brand.asset),"utf8");
  if(/<\s*(script|foreignObject|iframe|image|style)\b|\bon[a-z]+\s*=|<!DOCTYPE|<!ENTITY|(?:href|src)\s*=\s*["'](?!#)|url\(\s*["']?(?!#)/iu.test(svg))broken.push(brand.id);
 }
}
console.log(JSON.stringify({catalogSize:catalog.length,localLogos:catalog.length-missing.length,missing,broken:[...new Set(broken)]}));
if(broken.length || catalog.length!==79)process.exitCode=1;
