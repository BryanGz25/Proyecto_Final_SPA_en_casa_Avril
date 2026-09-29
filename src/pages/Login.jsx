
import LoginFormulario from "../components/LoginFormulario";
import Encabezado from "../components/Encabezado";

export default function Login() {
  return (
    <>
      <Encabezado />

      <main className="pagina login-pagina">
        <section className="login-contenedor">
          <span className="eyebrow">Bienvenido a Avrill</span>
          <h1>Inicia sesión</h1>
          <p>
            Accede a tu espacio de cliente o al panel
            administrativo.
          </p>

          <LoginFormulario />
        </section>
      </main>
    </>
  );
}