/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AuditResolvedCheck, AuditRun } from "../types";
import type { AuditScore } from "../scoring";
import { getStatusLabel } from "../types";
import { sortChecksByPriority } from "./sort";

export interface AuditReportProps {
  run: AuditRun;
  score: AuditScore;
  resolvedChecks: AuditResolvedCheck[];
  benchmark?: {
    industryLabel: string;
    industryAvgScore0to100: number;
  };
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: "#555", marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  kpiRow: { flexDirection: "row", gap: 12 },
  kpiBox: {
    flexGrow: 1,
    border: "1px solid #eee",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  kpiLabel: { color: "#666", marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: 700 },
  tableRow: { borderBottom: "1px solid #eee", paddingVertical: 10 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  rowTitle: { fontSize: 12, fontWeight: 700 },
  badge: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  // react-pdf's StyleSheet typing is strict; we intentionally cast these as compatible overrides.
  badgePass: { backgroundColor: "#dcfce7", color: "#166534" } as any,
  badgeWarn: { backgroundColor: "#fef9c3", color: "#854d0e" } as any,
  badgeFail: { backgroundColor: "#fee2e2", color: "#991b1b" } as any,
  muted: { color: "#555" },
  pillRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  pill: {
    fontSize: 9,
    backgroundColor: "#f3f4f6",
    color: "#111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
});

function StatusBadge({ status }: { status: AuditResolvedCheck["result"]["status"] }) {
  const style: any[] = [styles.badge];
  if (status === "pass") style.push(styles.badgePass);
  if (status === "warn") style.push(styles.badgeWarn);
  if (status === "fail") style.push(styles.badgeFail);

  return <Text style={style}>{getStatusLabel(status)}</Text>;
}

export function AuditReportDocument(props: AuditReportProps) {
  const sorted = sortChecksByPriority(props.resolvedChecks);

  return (
    <Document title="E-Commerce Audit Report">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>E-Commerce Audit Report</Text>
        <Text style={styles.subtitle}>
          URL: {props.run.url} · Audited at: {props.run.auditedAt}
        </Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Overall score</Text>
            <Text style={styles.kpiValue}>{props.score.overall.score0to100}/100</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Industry average</Text>
            <Text style={styles.kpiValue}>
              {props.benchmark ? `${props.benchmark.industryAvgScore0to100}/100` : "—"}
            </Text>
            {props.benchmark ? <Text style={styles.muted}>({props.benchmark.industryLabel})</Text> : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category breakdown</Text>
        {props.score.byCategory.map((c) => (
          <View key={c.category} style={styles.tableRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{c.category.toUpperCase()}</Text>
              <Text style={styles.rowTitle}>{c.score0to100}/100</Text>
            </View>
            <Text style={styles.muted}>
              Earned {c.earned.toFixed(1)} of {c.possible.toFixed(1)}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Findings (sorted by priority)</Text>
        {sorted.map((c) => (
          <View key={c.definition.id} style={styles.tableRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{c.definition.title}</Text>
              <StatusBadge status={c.result.status} />
            </View>
            <Text style={styles.muted}>Severity: {c.definition.severity}</Text>

            {c.result.evidence?.length ? (
              <View style={styles.pillRow}>
                {c.result.evidence.slice(0, 6).map((e, idx) => (
                  <Text key={idx} style={styles.pill}>
                    {e}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={[styles.muted, { marginTop: 6 }]}>Why important</Text>
            <Text>{c.definition.whyImportant}</Text>

            <Text style={[styles.muted, { marginTop: 6 }]}>How to fix</Text>
            <Text>{c.definition.howToFix}</Text>

            {c.definition.references?.length ? (
              <Text style={[styles.muted, { marginTop: 6 }]}>
                References: {c.definition.references.map((r) => r.title).join(", ")}
              </Text>
            ) : null}
          </View>
        ))}
      </Page>
    </Document>
  );
}
