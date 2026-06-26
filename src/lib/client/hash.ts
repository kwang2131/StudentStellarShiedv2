"use client";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const buffer = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(buffer).set(encoded);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return toHex(digest);
}
