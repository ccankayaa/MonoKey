import { messages, type MessageKey } from "./messages";
import { useAppSelector } from "../app/hooks";
import { useCallback } from "react";

export function useTranslation(): { t: (key: MessageKey) => string; locale: "tr" | "en" } {
  const locale = useAppSelector(state => state.preferences.locale);
  const t = useCallback((key: MessageKey): string => messages[locale][key], [locale]);
  return { locale, t };
}
