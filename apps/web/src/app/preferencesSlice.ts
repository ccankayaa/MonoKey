import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Appearance = "system" | "light" | "dark";
export type Locale = "tr" | "en";

interface PreferencesState {
  appearance: Appearance;
  locale: Locale;
}

const storedAppearance = localStorage.getItem("vaultx.appearance");
const storedLocale = localStorage.getItem("vaultx.locale");
const initialState: PreferencesState = {
  appearance: storedAppearance === "light" || storedAppearance === "dark" ? storedAppearance : "system",
  locale: storedLocale === "en" ? "en" : "tr",
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setAppearance(state, action: PayloadAction<Appearance>) {
      state.appearance = action.payload;
      localStorage.setItem("vaultx.appearance", action.payload);
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      localStorage.setItem("vaultx.locale", action.payload);
    },
  },
});

export const { setAppearance, setLocale } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
