import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";

// Backport Expo's reviewed Swift 6.2 fix until it is released for SDK 57.
// Provenance, exact affected package and before/after hashes live beside the patch.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(repository, "apps/node_modules/expo-modules-jsi");
const manifest = JSON.parse(readFileSync(resolve(repository, "scripts/patches/expo-modules-jsi-swift62.json"), "utf8"));
const version = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8")).version;
if (version !== manifest.packageVersion) throw new Error("The Expo compatibility patch needs review for this dependency version.");
function hash(path) {
  try { return createHash("sha256").update(readFileSync(resolve(packageRoot, path), "utf8").replaceAll("\r\n", "\n")).digest("hex"); }
  catch (error) {if (error.code === "ENOENT") return null; throw error;}
}
const entries = Object.entries(manifest.files);
if (entries.every(([path, expected]) => hash(path) === expected.after)) {
  process.stdout.write("Reviewed Expo Swift 6.2 compatibility fix already applied.\n");
} else {
  if (!entries.every(([path, expected]) => hash(path) === expected.before)) throw new Error("Expo native source differs from the reviewed compatibility patch.");
  const patch = "scripts/patches/expo-modules-jsi-swift62.patch";
  for (const extra of [["--check"], []]) {
    const result = spawnSync("git", ["apply", "--unidiff-zero", ...extra, "--directory=apps/node_modules/expo-modules-jsi", patch], {cwd: repository, encoding:"utf8"});
    if (result.status !== 0) throw new Error("The reviewed Expo native compatibility patch could not be applied.");
  }
  if (!entries.every(([path, expected]) => hash(path) === expected.after)) throw new Error("Patched Expo native source failed verification.");
  process.stdout.write("Reviewed Expo Swift 6.2 compatibility fix applied; all three source hashes verified.\n");
}
