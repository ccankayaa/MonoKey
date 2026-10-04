import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
const light = { canvas: "#FCFCFA", surface: "#FFFFFF", subtle: "#EEF1F6", text: "#101828", secondary: "#475467", muted: "#667085", border: "#DDE3EC", brand: "#6366F1", success: "#12805C", danger: "#B42318" };
const dark = { canvas: "#0B0F19", surface: "#1A2235", subtle: "#202A40", text: "#F8FAFC", secondary: "#94A3B8", muted: "#94A3B8", border: "#334155", brand: "#818CF8", success: "#10B981", danger: "#F87171" };
export type Appearance = "system" | "light" | "dark";
const Theme = createContext({ colors: light, appearance: "system" as Appearance, setAppearance: (_value: Appearance): void => {} });
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme(); const [appearance, setValue] = useState<Appearance>("system");
  useEffect(() => { void SecureStore.getItemAsync("monokey.appearance").then(value => { if (value === "light" || value === "dark") setValue(value); }); }, []);
  const setAppearance = (value: Appearance): void => { setValue(value); void SecureStore.setItemAsync("monokey.appearance", value); };
  return <Theme.Provider value={{ colors: appearance === "dark" || appearance === "system" && system === "dark" ? dark : light, appearance, setAppearance }}>{children}</Theme.Provider>;
}
export const useTheme = () => useContext(Theme);
export const useColors = () => useTheme().colors;
