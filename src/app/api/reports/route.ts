// src/app/api/reports/route.ts
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ctToraxSchema } from "@/models/ct_torax.schema"

export async function POST(request: Request) {
  console.log("\n--- NOVA REQUISIÇÃO PARA /api/reports ---");
  const session = await auth();

  // VAMOS VER O QUE ESTÁ DENTRO DA SESSÃO
  console.log("SESSÃO OBTIDA NA API:", JSON.stringify(session, null, 2));

  if (!session?.user?.id) {
    console.error("ERRO: Sessão não encontrada ou sem user.id. Acesso negado.");
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  console.log(`SUCESSO: Sessão válida para o usuário ID: ${session.user.id}`);

  const data = await request.json();

  try {
    const validatedData = ctToraxSchema.parse(data);

    const newReport = await prisma.report.create({
      data: {
        patientId: validatedData.patient.id,
        patientSex: validatedData.patient.sex,
        patientAge: validatedData.patient.age,
        indication: validatedData.indication,
        technique: validatedData.technique,
        findings: validatedData.findings,
        impression: validatedData.impression,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar o laudo:", error);
    return NextResponse.json({ error: "Dados inválidos ou erro no servidor" }, { status: 400 });
  }
}