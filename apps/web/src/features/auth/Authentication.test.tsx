import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPage } from "./AuthPage";
import { PasswordResetPage } from "./PasswordResetPage";
const sdk = vi.hoisted(() => ({ register: vi.fn(), login: vi.fn(), popup: vi.fn(), reset: vi.fn(), verify: vi.fn(), confirm: vi.fn(), auth: { languageCode: "" } }));
vi.mock("firebase/auth", () => ({ createUserWithEmailAndPassword: sdk.register, signInWithEmailAndPassword: sdk.login, signInWithPopup: sdk.popup, sendPasswordResetEmail: sdk.reset, verifyPasswordResetCode: sdk.verify, confirmPasswordReset: sdk.confirm }));
vi.mock("../../app/firebase", () => ({ auth: sdk.auth, firebaseConfigured: true, googleProvider: "google", appleProvider: "apple" }));
vi.mock("../../i18n/useTranslation", () => ({ useTranslation: () => ({ locale: "en", t: (key: string) => key }) }));
function credentials(email: string, password: string) { fireEvent.change(screen.getByLabelText("email"), { target: { value: email } }); fireEvent.change(screen.getByLabelText("password"), { target: { value: password } }); }
describe("authentication incident regressions", () => {
  beforeEach(() => { vi.resetAllMocks(); history.replaceState(null, "", "/"); });
  it("blocks blank signup before accounts:signUp", async () => {
    render(<AuthPage />); fireEvent.click(screen.getByRole("button", { name: "signUp" })); fireEvent.click(screen.getByRole("button", { name: "signUp" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("valid email"); expect(sdk.register).not.toHaveBeenCalled();
  });
  it("normalizes email while preserving password whitespace on signup", async () => {
    render(<AuthPage />); fireEvent.click(screen.getByRole("button", { name: "signUp" })); credentials("person@example.test   ", "  A-long-Password  "); fireEvent.click(screen.getByRole("button", { name: "signUp" }));
    await waitFor(() => expect(sdk.register).toHaveBeenCalledWith(sdk.auth, "person@example.test", "  A-long-Password  "));
  });
  it("routes email login independently", async () => {
    render(<AuthPage />); credentials("person@example.test", "  A-long-Password  "); fireEvent.click(screen.getByRole("button", { name: "signIn" }));
    await waitFor(() => expect(sdk.login).toHaveBeenCalledWith(sdk.auth, "person@example.test", "  A-long-Password  ")); expect(sdk.register).not.toHaveBeenCalled();
  });
  it("Google needs no form email and prevents duplicate sign-in", () => {
    sdk.popup.mockReturnValue(new Promise(() => undefined)); render(<AuthPage />);
    const button=screen.getByRole("button", { name: "google" }); fireEvent.click(button); fireEvent.click(button);
    expect(sdk.popup).toHaveBeenCalledExactlyOnceWith(sdk.auth, "google"); expect(sdk.register).not.toHaveBeenCalled(); expect(sdk.login).not.toHaveBeenCalled();
  });
  it("maps popup errors without revealing SDK messages", async () => {
    sdk.popup.mockRejectedValue({ code: "auth/popup-blocked", message: "SECRET" }); render(<AuthPage />); fireEvent.click(screen.getByRole("button", { name: "google" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Allow popups"); expect(document.body).not.toHaveTextContent("SECRET");
  });
  it("reset wording does not enumerate users", async () => {
    sdk.reset.mockRejectedValue({ code: "auth/user-not-found" }); render(<AuthPage />); fireEvent.click(screen.getByRole("button", { name: "Forgot password?" })); fireEvent.change(screen.getByLabelText("email"), { target: { value: "person@example.test" } }); fireEvent.click(screen.getByRole("button", { name: "resetPassword" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("resetSent");
  });
});
describe("password reset action handler", () => {
  beforeEach(() => { vi.resetAllMocks(); history.replaceState(null, "", "/auth/reset?mode=resetPassword&oobCode=disposable-test-code&apiKey=public-placeholder"); });
  it("validates before rendering and strips action parameters", async () => {
    sdk.verify.mockResolvedValue("person@example.test"); render(<PasswordResetPage />);
    expect(screen.queryByLabelText("password")).not.toBeInTheDocument(); await screen.findByLabelText("password"); expect(location.search).toBe("");
    expect(sdk.verify).toHaveBeenCalledWith(sdk.auth, "disposable-test-code");
  });
  it.each(["auth/invalid-action-code", "auth/expired-action-code"])("rejects %s", async code => {
    sdk.verify.mockRejectedValue({ code }); render(<PasswordResetPage />); expect(await screen.findByRole("alert")).toHaveTextContent("expired or already used"); expect(screen.queryByLabelText("password")).not.toBeInTheDocument();
  });
  it("rejects a code consumed after validation without changing password bytes", async () => {
    sdk.verify.mockResolvedValue("person@example.test"); sdk.confirm.mockRejectedValue({ code: "auth/invalid-action-code" }); render(<PasswordResetPage />);
    fireEvent.change(await screen.findByLabelText("password"), { target: { value: "  A-long-Password  " } }); fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "  A-long-Password  " } }); fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("already used"); expect(sdk.confirm).toHaveBeenCalledWith(sdk.auth, "disposable-test-code", "  A-long-Password  ");
  });
});
