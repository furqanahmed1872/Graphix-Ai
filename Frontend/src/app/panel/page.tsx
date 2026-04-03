"use client";
import dynamic from "next/dynamic";

const DataChartEditor = dynamic(() => import("./ExelChartEditor"), {
  ssr: false,
});

export default function Page() {
  return <DataChartEditor />;
}
