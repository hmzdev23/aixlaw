/**
 * Shared @react-pdf/renderer StyleSheet for Supervisor PDF templates.
 * Tokens mirror /design.MD without using Tailwind (react-pdf has its own
 * subset of CSS — Tailwind doesn't apply here).
 */

import { StyleSheet } from "@react-pdf/renderer";

export const BRAND = "#FF4B00";
export const TEXT = "#111111";
export const MUTED = "#666666";
export const RULE = "#E5E5E5";
export const PALE_BG = "#FFF5F0";
export const RED = "#C00000";
export const GREEN = "#1B7A3D";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontSize: 10,
    color: TEXT,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },
  brandBar: {
    height: 4,
    width: 64,
    backgroundColor: BRAND,
    marginBottom: 14,
  },
  h1: {
    fontSize: 22,
    color: TEXT,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 13,
    color: TEXT,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
  },
  meta: {
    color: MUTED,
    fontSize: 9,
    marginBottom: 18,
  },
  paragraph: {
    marginBottom: 8,
  },
  callout: {
    backgroundColor: PALE_BG,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
    paddingLeft: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    marginBottom: 12,
  },
  calloutLabel: {
    fontSize: 8,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  calloutBody: {
    fontSize: 11,
    color: TEXT,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: RULE,
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: BRAND,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableCellLabel: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    color: MUTED,
    fontSize: 9,
  },
  tableCellValue: {
    flex: 2,
    paddingVertical: 5,
    paddingHorizontal: 8,
    color: TEXT,
    fontSize: 10,
  },
  clauseRow: {
    marginBottom: 10,
  },
  clauseTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
    marginBottom: 2,
  },
  clauseAsk: {
    color: RED,
    fontSize: 9,
    marginBottom: 1,
  },
  clauseCounter: {
    color: GREEN,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  pillExistential: {
    color: "#9C0000",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  pillHigh: {
    color: "#B85C00",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: MUTED,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 6,
  },
});
