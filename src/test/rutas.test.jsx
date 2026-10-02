import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import PrivateRoutes from "../routes/PrivateRoutes";

const mocks = vi.hoisted(() => ({
  contexto: {},
  validar: vi.fn(),
  cerrarSesion: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../routes/Routing", () => ({
  useAppContext: () => mocks.contexto,
}));

vi.mock("../services/api", () => ({
  apiSesion: {
    validar: mocks.validar,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks.contexto, {
    usuarioActivo: null,
    rutaActual: "/carrito",
    cerrarSesion: mocks.cerrarSesion,
    navigate: mocks.navigate,
  });
});

afterEach(cleanup);

describe("PrivateRoutes", () => {
  it("permite el contenido protegido cuando la sesión coincide", async () => {
    mocks.contexto.usuarioActivo = { id: 5, rol: "cliente" };
    mocks.validar.mockResolvedValue({ usuario: { id: 5, rol: "cliente" } });

    render(
      <PrivateRoutes>
        <p>Carrito protegido</p>
      </PrivateRoutes>
    );

    expect(await screen.findByText("Carrito protegido")).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("redirige al login y cierra la sesión si no hay un usuario autenticado", async () => {
    mocks.validar.mockResolvedValue({ usuario: null });

    render(
      <PrivateRoutes>
        <p>Carrito protegido</p>
      </PrivateRoutes>
    );

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/login"));
    expect(mocks.cerrarSesion).toHaveBeenCalledOnce();
    expect(screen.queryByText("Carrito protegido")).toBeNull();
  });

  it("redirige a inicio si un cliente intenta abrir una ruta de administrador", async () => {
    mocks.contexto.usuarioActivo = { id: 5, rol: "cliente" };
    mocks.validar.mockResolvedValue({ usuario: { id: 5, rol: "cliente" } });

    render(
      <PrivateRoutes soloAdmin>
        <p>Panel administrativo</p>
      </PrivateRoutes>
    );

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Panel administrativo")).toBeNull();
  });
});