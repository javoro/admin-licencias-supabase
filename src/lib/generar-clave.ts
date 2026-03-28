const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChar(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return CHARS[array[0] % CHARS.length];
}

function randomGroup(length: number): string {
  return Array.from({ length }, randomChar).join("");
}

export function generarClave(): string {
  return [
    randomGroup(4),
    randomGroup(4),
    randomGroup(4),
    randomGroup(4),
  ].join("-");
}
