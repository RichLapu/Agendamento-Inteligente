import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ação de Deletar
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvido = await params;
    await prisma.evento.delete({
      where: { id: Number(resolvido.id) },
    });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao deletar evento' }, { status: 500 });
  }
}

// Ação de Editar
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvido = await params;
    const corpo = await req.json();
    
    const eventoAtualizado = await prisma.evento.update({
      where: { id: Number(resolvido.id) },
      data: {
        titulo: corpo.titulo,
        data: corpo.data,
        hora: corpo.hora,
      },
    });
    
    return NextResponse.json({ sucesso: true, dados: eventoAtualizado });
  } catch (error) {
    return NextResponse.json({ erro: 'Falha ao atualizar evento' }, { status: 500 });
  }
}