"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";
import type { AuditResolvedCheck, AuditRun } from "../types";
import type { AuditScore } from "../scoring";
import { AuditReportDocument } from "./AuditReportDocument";

export async function createAuditReportPdfBlob(input: {
  run: AuditRun;
  score: AuditScore;
  resolvedChecks: AuditResolvedCheck[];
  benchmark?: {
    industryLabel: string;
    industryAvgScore0to100: number;
  };
}): Promise<Blob> {
  const instance = pdf(
    <AuditReportDocument
      run={input.run}
      score={input.score}
      resolvedChecks={input.resolvedChecks}
      benchmark={input.benchmark}
    />
  );

  return instance.toBlob();
}

export async function downloadAuditReportPdf(input: {
  run: AuditRun;
  score: AuditScore;
  resolvedChecks: AuditResolvedCheck[];
  benchmark?: {
    industryLabel: string;
    industryAvgScore0to100: number;
  };
  filename?: string;
}): Promise<void> {
  const blob = await createAuditReportPdfBlob(input);
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download =
      input.filename ?? `ecommerce-audit-${new Date(input.run.auditedAt).toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
