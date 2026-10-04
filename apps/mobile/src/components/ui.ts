import { StyleSheet } from "react-native";
import { useColors } from "../theme";

export function useUi() { const colors = useColors(); return StyleSheet.create({
  title: { fontSize: 30, lineHeight: 38, fontWeight: "700", color: colors.text },
  heading: { fontSize: 20, fontWeight: "700", color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.secondary },
  card: { padding: 18, gap: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  input: { minHeight: 48, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface, color: colors.text },
  button: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 8, paddingHorizontal: 16, backgroundColor: colors.brand },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
  secondaryButton: { backgroundColor: colors.subtle },
  secondaryButtonText: { color: colors.text },
  error: { color: colors.danger },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
}); }
