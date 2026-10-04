import { Component, type PropsWithChildren } from "react";
import { messages } from "../i18n/messages";

interface State { failed: boolean }
export class ErrorBoundary extends Component<PropsWithChildren, State> {
  public override state: State = { failed: false };
  public static getDerivedStateFromError(): State { return { failed: true }; }
  public override componentDidCatch(): void {
    // Intentionally omit error objects: vault plaintext must never enter telemetry or logs.
  }
  public override render() {
    const locale = localStorage.getItem("vaultx.locale") === "en" ? "en" : "tr";
    return this.state.failed
      ? <main className="auth-page"><section className="card"><h1>MonoKey</h1><p>{messages[locale].fatalError}</p><button className="button" onClick={() => location.reload()}>{messages[locale].reload}</button></section></main>
      : this.props.children;
  }
}
