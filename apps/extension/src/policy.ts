import { exactOriginMatches } from "@monokey/crypto";

export function canFill(savedUrl: string, pageUrl: string, frameId: number): boolean {
  return frameId === 0 && exactOriginMatches(savedUrl, pageUrl);
}
