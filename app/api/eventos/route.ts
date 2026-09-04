import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: { data: 'asc' }, // Ordena do mais próximo para o mais distante
    });
    
    return NextResponse.json(eventos);
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao buscar eventos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const corpo = await req.json();
    const novoEvento = await prisma.evento.create({
      data: {
        titulo: corpo.titulo,
        data: corpo.data,
        hora: corpo.hora,
      },
    });
    return NextResponse.json({ sucesso: true, dados: novoEvento });
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao criar evento manualmente' }, { status: 500 });
  }
}