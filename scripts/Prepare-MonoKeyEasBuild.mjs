import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const repository=resolve(dirname(fileURLToPath(import.meta.url)),"..");
function run(program,args,cwd=repository){const result=spawnSync(program,args,{cwd,stdio:"inherit"});if(result.error || result.status!==0)throw new Error("EAS native preparation failed.");}
run("npm",["run","build","--workspace","@monokey/contracts"],resolve(repository,"apps"));
run("npm",["run","build","--workspace","@monokey/crypto"],resolve(repository,"apps"));
if(process.env.EAS_BUILD_PLATFORM==="ios"){
 run(process.execPath,["scripts/Apply-MonoKeyExpoIosCompatibility.mjs"]);
 run(process.execPath,["scripts/Build-MonoKeyCredentialExtension.mjs"]);
}
