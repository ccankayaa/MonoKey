import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { store } from "./app/store";

const authState = vi.hoisted(() => ({ loading: true, user: null as null }));
vi.mock("./features/auth/AuthContext", () => ({ useAuth: () => authState }));

describe("authentication guard", () => {
  beforeEach(() => { localStorage.clear(); authState.loading = true; authState.user = null; });

  it("shows a localized loading boundary and then the sign-in screen for anonymous users", () => {
    const view = render(<Provider store={store}><App /></Provider>);
    expect(screen.getByRole("status")).toHaveTextContent("Yükleniyor");
    authState.loading = false;
    view.rerender(<Provider store={store}><App /></Provider>);
    expect(screen.getByRole("heading", { name: "Giriş yap" })).toBeInTheDocument();
    expect(screen.queryByText("Genel Bakış")).not.toBeInTheDocument();
  });
});
