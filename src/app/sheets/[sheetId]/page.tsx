import React from "react";
import { notFound } from "next/navigation";
import { getSheetBySlug, getSheetsMeta } from "@/lib/sheetsService";
import SheetViewerClient from "./SheetViewerClient";

interface PageProps {
  params: Promise<{ sheetId: string }>;
}

export async function generateStaticParams() {
  const meta = getSheetsMeta();
  return meta.sheets.map((s) => ({
    sheetId: s.slug,
  }));
}

export default async function SheetPage({ params }: PageProps) {
  const { sheetId } = await params;
  const sheetData = getSheetBySlug(sheetId);

  if (!sheetData) {
    notFound();
  }

  return <SheetViewerClient sheetData={sheetData} />;
}
