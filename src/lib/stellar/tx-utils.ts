import { createHash, randomUUID } from "node:crypto";

import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";

export function createDeterministicHash(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

export function createCaseId(seed?: string) {
  return createDeterministicHash(`${seed ?? "studybond"}:${randomUUID()}`);
}

export function toBaseUnits(amount: number | string, decimals = 7) {
  const [wholePart, fractionalPart = ""] = `${amount}`.split(".");
  const normalizedFraction = fractionalPart.padEnd(decimals, "0").slice(0, decimals);
  return (
    BigInt(wholePart) * BigInt(10) ** BigInt(decimals) + BigInt(normalizedFraction)
  );
}

export function fromBaseUnits(amount: bigint | number | string, decimals = 7) {
  const value = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionText.length > 0 ? `${whole}.${fractionText}` : whole.toString();
}

export function addressToScVal(address: string) {
  return new Address(address).toScVal();
}

export function bytes32HexToScVal(value: string) {
  return xdr.ScVal.scvBytes(Buffer.from(value, "hex"));
}

export function optionalAddressToScVal(address?: string) {
  return address ? addressToScVal(address) : xdr.ScVal.scvVoid();
}

export function i128ToScVal(value: bigint) {
  return nativeToScVal(value, { type: "i128" });
}

export function u32ToScVal(value: number) {
  return nativeToScVal(value, { type: "u32" });
}

export function hashFromText(text: string) {
  return createDeterministicHash(text);
}
