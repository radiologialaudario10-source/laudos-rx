// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs"; // garante Node runtime (fs disponível)
export const dynamic = "force-dynamic"; // evita cache de rota

type Body = {
  html?: string;
  template?: string;
};

function getBaseDir() {
  // Em produção (Vercel): /tmp
  // Em dev: <root>/tmp/reports
  if (process.env.NODE_ENV === "production") {
    return "/tmp/reports";
  }
  return path.join(process.cwd(), "tmp", "reports");
}

export async function POST(req: Request) {
  try {
    const { html, template }: Body = await req.json().catch(() => ({}));
    if (typeof html !== "string" || !html.trim()) {
      return NextResponse.json(
        { error: "HTML vazio ou ausente" },
        { status: 400 }
      );
    }

    const id =
      (globalThis as any).crypto?.randomUUID?.() ??
      // fallback simples
      `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const dir = getBaseDir();
    await mkdir(dir, { recursive: true });

    // arquivo .html com o seu conteúdo
    const filePath = path.join(dir, `${id}.html`);
    await writeFile(
      filePath,
      `<!-- template: ${template || "-"} -->\n${html}`,
      "utf8"
    );

    return NextResponse.json({ id }, { status: 200 });
  } catch (e: any) {
    console.error("[/api/reports] ERRO:", e?.message || e);
    return NextResponse.json(
      { error: e?.message ?? "Falha ao salvar" },
      { status: 500 }
    );
  }
}
