import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const repository=resolve(dirname(fileURLToPath(import.meta.url)),"..");
function run(program,args,cwd=repository){const result=spawnSync(program,args,{cwd,stdio:"inherit"});if(result.error || result.status!==0)throw new Error("EAS native preparation failed.");}
// Expo reads app.config before its post-install build hook. Prepare workspace
// exports in npm's own postinstall lifecycle, before config and native prebuild.
run(process.execPath,["apps/node_modules/typescript/bin/tsc","-p","apps/packages/contracts/tsconfig.json"]);
run(process.execPath,["apps/node_modules/typescript/bin/tsc","-p","apps/packages/crypto/tsconfig.json"]);
if(process.env.EAS_BUILD_PLATFORM==="ios"){
 run(process.execPath,["scripts/Apply-MonoKeyExpoIosCompatibility.mjs"]);
 run(process.execPath,["scripts/Build-MonoKeyCredentialExtension.mjs"]);
}
