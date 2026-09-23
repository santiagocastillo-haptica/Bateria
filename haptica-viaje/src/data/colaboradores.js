/**
 * colaboradores.js — roster interno de Háptica (nombre, seudónimo, rol).
 * Fuente: TABLA_DATOS_BATERIA.xlsx entregado por Santiago. Actualizar este
 * archivo (y hacer un nuevo deploy) cuando cambie el equipo.
 */

/** @type {Array<{nombre:string, seudonimo:string, correo:string, rol:"Usuario"|"Administrador"}>} */
export const COLABORADORES = [
  { nombre: "Alejandro Azul Cardona Pabon", seudonimo: "Azul", correo: "azul.cardona@haptica.co", rol: "Usuario" },
  { nombre: "Angelica Maria Flechas Bustos", seudonimo: "Angélica/Boss", correo: "angelica@haptica.co", rol: "Usuario" },
  { nombre: "Camilo Alberto Niño Silva", seudonimo: "Cami / Milo", correo: "camilo.nino@haptica.co", rol: "Usuario" },
  { nombre: "Daniel Felipe Pinilla Marmolejo", seudonimo: "Dani", correo: "daniel@haptica.co", rol: "Usuario" },
  { nombre: "Geovanny Sanchez Soto", seudonimo: "Geo", correo: "contabilidad@haptica.co", rol: "Usuario" },
  { nombre: "Jhojann Steven Rodriguez Rodríguez", seudonimo: "Jhojann", correo: "jhojann.rodriguez@haptica.co", rol: "Usuario" },
  { nombre: "Juliana Lopez Gomez", seudonimo: "July", correo: "juliana.lopez@haptica.co", rol: "Administrador" },
  { nombre: "Kevin Orlando Barbosa Riveros", seudonimo: "Kevin", correo: "kevin.barbosa@haptica.co", rol: "Usuario" },
  { nombre: "Maria Alejandra Corrales Gonzalez", seudonimo: "Mariale", correo: "mariaalejandra@haptica.co", rol: "Usuario" },
  { nombre: "Maria Alejandra Mariño", seudonimo: "Male", correo: "maria.marino@haptica.co", rol: "Usuario" },
  { nombre: "Maria Camila Venegas Ariza", seudonimo: "Mariaca", correo: "mariacamila@haptica.co", rol: "Usuario" },
  { nombre: "Maria Fernanda Martinez", seudonimo: "Mafe", correo: "maria.martinez@haptica.co", rol: "Usuario" },
  { nombre: "Maria Isabel Marta Rodriguez", seudonimo: "Isa", correo: "maria.marta@haptica.co", rol: "Administrador" },
  { nombre: "Nicholle Iriana Torres Piraquive", seudonimo: "Nicho", correo: "nicholle.torres@haptica.co", rol: "Usuario" },
  { nombre: "Santiago Castillo", seudonimo: "santi", correo: "santiago.castillo@haptica.co", rol: "Administrador" },
  { nombre: "Stiben Camilo Ibarra Pinchao", seudonimo: "Stev", correo: "stiben.ibarra@haptica.co", rol: "Usuario" },
  { nombre: "Daniela Caicedo Aristizabal", seudonimo: "Dani", correo: "daniela.caicedo@haptica.co", rol: "Usuario" },
  { nombre: "Natalia Carolina Rodriguez Sánchez", seudonimo: "Naty", correo: "natalia.rodriguez@haptica.co", rol: "Usuario" },
  { nombre: "Maria Laura Patiño Sanchez", seudonimo: "Malala", correo: "marialaura.patino@haptica.co", rol: "Usuario" },
  { nombre: "María Camila Rueda", seudonimo: "Cami Rueda", correo: "camila.rueda@haptica.co", rol: "Usuario" },
  { nombre: "Luisa García", seudonimo: "Lu", correo: "luisa.garcia@haptica.co", rol: "Usuario" },
  { nombre: "María Paz Hernández", seudonimo: "Paz", correo: "mariapaz.hernandez@haptica.co", rol: "Usuario" },
];

const POR_CORREO = new Map(COLABORADORES.map((c) => [c.correo.toLowerCase(), c]));

/** Busca el colaborador por correo (case-insensitive). Undefined si no está en el roster. */
export function colaboradorPorCorreo(correo) {
  return POR_CORREO.get((correo || "").toLowerCase());
}
