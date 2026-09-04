import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Cronômetro 1: Tempo de resposta do Google Gemini
    console.time('Tempo_IA');
    const resultado = await generateObject({
      model: google('gemini-3.6-flash'),
      system: `Hoje é ${dataAtual}. Extraia os dados. 
               Regra 1: Data SEMPRE no formato YYYY-MM-DD. 
               Regra 2: Hora SEMPRE em HH:MM (use 00:00 se não houver).
               Regra 3: Se não tiver fim, retorne null.`,
      prompt: prompt,
      schema: z.object({
        titulo: z.string(),
        data: z.string(),
        hora: z.string(),
        dataFim: z.string().nullable().optional(),
        horaFim: z.string().nullable().optional(),
        categoria: z.string().nullable().optional(),
      }),
    });
    console.timeEnd('Tempo_IA');
    
    const cat = resultado.object.categoria?.toLowerCase() || 'pessoal';
    const categoriaFinal = ['trabalho', 'estudos', 'pessoal'].includes(cat) ? cat : 'pessoal';

    // Cronômetro 2: Tempo de gravação no MySQL (AWS RDS)
    console.time('Tempo_AWS');
    const novoEvento = await prisma.evento.create({
      data: {
        titulo: resultado.object.titulo,
        data: resultado.object.data,
        hora: resultado.object.hora || '00:00',
        dataFim: resultado.object.dataFim || null,
        horaFim: resultado.object.horaFim || null,
        categoria: categoriaFinal,
      },
    });
    console.timeEnd('Tempo_AWS');

    return NextResponse.json({ sucesso: true, dados: novoEvento });
  } catch (error: any) {
    console.error(">>> MOTIVO DA FALHA:", error.message || error);
    return NextResponse.json({ erro: 'Falha interna' }, { status: 500 });
  }
}