/**
 * browserDetect.js — detección de navegadores embebidos (in-app browsers)
 * que Google bloquea para el login de OAuth.
 *
 * Google rechaza activamente signInWithPopup/signInWithRedirect dentro de
 * WebViews embebidos como el navegador interno de WhatsApp, Instagram,
 * Facebook, Line, etc. (error "This browser or app may not be secure" /
 * `disallowed_useragent`). Esto ocurre en la propia página de
 * accounts.google.com, sin importar si Firebase usa popup o redirect, así
 * que la única solución real es detectar el WebView ANTES de intentar el
 * login y pedirle al usuario que abra el enlace en un navegador real.
 *
 * Toda la lógica de detección vive en este único archivo. Las firmas están
 * acotadas a patrones conocidos y documentados para evitar falsos positivos
 * que bloqueen a un participante real en Chrome/Safari/Edge legítimos.
 */

/**
 * Detecta si el navegador actual es un WebView embebido conocido
 * (WhatsApp, Instagram, Facebook/Messenger, Line, o un WebView Android
 * genérico) donde Google bloquea el inicio de sesión con OAuth.
 */
export function esNavegadorEmbebido() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";

  // Firmas explícitas de apps conocidas que embeben un WebView.
  if (/\bWhatsApp\b/i.test(ua)) return true; // WhatsApp (Android/iOS)
  if (/\bInstagram\b/i.test(ua)) return true; // Instagram in-app browser
  if (/FBAN|FBAV|FB_IAB|FBIOS|\bMessenger\b/i.test(ua)) return true; // Facebook / Messenger
  if (/\bLine\//i.test(ua)) return true; // LINE
  if (/\bTwitter\b|\bTikTok\b/i.test(ua)) return true; // Twitter/X, TikTok in-app

  // WebView genérico de Android: Chrome real NUNCA trae "; wv)" en el UA.
  // (Ver documentación de Android WebView User-Agent.)
  if (/; ?wv\)/i.test(ua)) return true;

  // Android con "Version/" en el UA (sin "Chrome/") suele ser un WebView
  // que se hace pasar por el navegador del sistema, distinto de Chrome.
  if (/Android/i.test(ua) && /Version\//i.test(ua) && !/Chrome\//i.test(ua)) return true;

  // iOS: Safari real siempre trae "Safari/" en el UA. Un WebView de iOS
  // (SFSafariViewController/WKWebView de apps) normalmente lo omite,
  // aunque use el motor WebKit. CriOS (Chrome en iOS) sí es un navegador
  // real y no debe marcarse.
  const esIOS = /iPhone|iPad|iPod/i.test(ua);
  if (esIOS && !/Safari\//i.test(ua) && !/CriOS\//i.test(ua) && !/FxiOS\//i.test(ua)) {
    return true;
  }

  return false;
}

/** true en Android (para decidir si mostramos el botón "Abrir en Chrome"). */
export function esAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

/** true en iOS/iPadOS (para mostrar las instrucciones de "Abrir en Safari"). */
export function esIOS() {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ en modo "Escritorio" se reporta como Mac con soporte táctil.
  const tieneTouch = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent || "") ||
    (/Macintosh/i.test(navigator.userAgent || "") && tieneTouch)
  );
}

/**
 * Construye un intent:// de Android para intentar abrir la URL actual en
 * Chrome directamente desde el WebView embebido (mejor esfuerzo: no todos
 * los in-app browsers respetan intent://, por eso siempre se ofrece
 * también copiar el enlace como respaldo).
 */
export function intentUrlChrome(urlActual) {
  try {
    const u = new URL(urlActual);
    const sinEsquema = `${u.host}${u.pathname}${u.search}${u.hash}`;
    return `intent://${sinEsquema}#Intent;scheme=https;package=com.android.chrome;end;`;
  } catch {
    return null;
  }
}

/**
 * Copia texto al portapapeles con respaldo para navegadores/WebViews donde
 * el Clipboard API moderno no está disponible o falla (Safari privado,
 * algunos in-app browsers). Nunca lanza: devuelve true/false.
 */
export async function copiarAlPortapapeles(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (_) {
    // sigue al respaldo
  }
  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch (_) {
    return false;
  }
}
