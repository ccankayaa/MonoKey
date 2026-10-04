import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { store } from "./app/store";
import { AuthProvider } from "./features/auth/AuthContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(<StrictMode><ErrorBoundary><Provider store={store}><AuthProvider><App /></AuthProvider></Provider></ErrorBoundary></StrictMode>);
