import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { monoKeyApi } from "./api";
import { preferencesReducer } from "./preferencesSlice";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    [monoKeyApi.reducerPath]: monoKeyApi.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(monoKeyApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
