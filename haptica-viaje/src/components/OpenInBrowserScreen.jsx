/**
 * OpenInBrowserScreen.jsx — se muestra ANTES del botón de ingreso cuando se
 * detecta un navegador embebido (WhatsApp, Instagram, Facebook, WebView de
 * Android, etc.). Google bloquea el login de OAuth dentro de esos
 * navegadores embebidos, así que sin esta pantalla el participante ve el
 * botón de "Ingresar", toca, y Google lo rebota sin explicación.
 */
import { useState } from "react";
import { esAndroid, esIOS, intentUrlChrome, copiarAlPortapapeles } from "../state/browserDetect.js";

export default function OpenInBrowserScreen() {
  const [copiado, setCopiado] = useState(false);
  const android = esAndroid();
  const ios = esIOS();
  const urlActual = typeof window !== "undefined" ? window.location.href : "";

  async function copiarEnlace() {
    const ok = await copiarAlPortapapeles(urlActual);
    setCopiado(ok);
    if (ok) setTimeout(() => setCopiado(false), 3000);
  }

  function abrirEnChrome() {
    const url = intentUrlChrome(urlActual);
    if (url) window.location.href = url;
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🌐</div>
        <h1>Abre este enlace en tu navegador</h1>
        <p className="sub">
          Parece que estás viendo esta página dentro de otra app (por ejemplo WhatsApp o
          Instagram). Por seguridad, Google no permite iniciar sesión desde ahí. Abre el enlace
          directamente en tu navegador para poder ingresar.
        </p>

        {android && (
          <div className="aviso">
            📱 <strong>En Android:</strong> toca el botón de abajo para abrirlo en Chrome. Si no
            funciona, toca los tres puntos (⋮) en la esquina de esta pantalla y elige
            "Abrir en Chrome" o "Abrir en el navegador".
          </div>
        )}
        {ios && (
          <div className="aviso">
            🍎 <strong>En iPhone/iPad:</strong> toca el ícono de compartir <strong>(⬆︎)</strong> o
            los tres puntos <strong>(⋯)</strong> en la parte de abajo o arriba de esta pantalla, y
            elige <strong>"Abrir en Safari"</strong>.
          </div>
        )}
        {!android && !ios && (
          <div className="aviso">
            Copia el enlace y pégalo en Chrome, Safari o Edge para continuar.
          </div>
        )}

        <div className="btn-fila">
          {android && (
            <button className="btn btn-primario" onClick={abrirEnChrome}>
              Abrir en Chrome
            </button>
          )}
          <button className="btn btn-outline" onClick={copiarEnlace}>
            {copiado ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
        </div>
      </div>
    </div>
  );
}
