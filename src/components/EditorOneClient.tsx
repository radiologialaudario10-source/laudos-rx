// src/components/EditorOneClient.tsx
"use client";
import dynamic from "next/dynamic";

const EditorOne = dynamic(() => import("./EditorOne"), { ssr: false });

export default function EditorOneClient() {
  return <EditorOne />;
}
