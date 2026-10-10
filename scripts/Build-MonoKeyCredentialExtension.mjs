import { build } from "../apps/node_modules/vite/dist/node/index.js";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"../apps/mobile");
await build({configFile:false,root,build:{target:"es2022",outDir:resolve(root,".native-autofill"),emptyOutDir:false,minify:true,sourcemap:false,lib:{entry:resolve(root,"native/ios-autofill/bridge.ts"),name:"MonoKeyCredentialBridge",formats:["iife"],fileName:()=>"bridge.js"}}});
