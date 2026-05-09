import { randomUUID } from "node:crypto";

/** Stable id factory used across inbound + execution. Server-only. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function newDealId(): string {
  return newId("deal");
}

export function newInboundEventId(): string {
  return newId("evt");
}
