/**
 * Normaliza una cadena de texto.
 *
 * Realiza normalización Unicode (NFD), elimina las marcas diacríticas (p. ej. las tildes),
 * convierte el resultado a minúsculas y recorta los espacios en los extremos.
 *
 * @param text - Cadena de entrada a normalizar.
 * @returns Cadena normalizada sin tildes, en minúsculas y sin espacios iniciales ni finales.
 */
export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // NOSONAR
    .toLowerCase()
    .trim()
}
