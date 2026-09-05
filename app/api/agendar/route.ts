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
    const hoje = new Date();
    const contextoData = hoje.toLocaleDateString('pt-BR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }); 
    // Isso gera algo como: "Hoje é sexta-feira, 4 de setembro de 2026"

    console.time('Tempo_IA');
    const resultado = await generateObject({
      model: google('gemini-3.5-flash-lite'),
      system: `Você é um assistente de agenda de alta precisão. 
      Contexto Temporal: ${contextoData}.
      
      Regras Estritas de Formatação:
      - Data: OBRIGATORIAMENTE no formato YYYY-MM-DD. Se o usuário disser "dia 25" ou "terça", calcule a data exata com base no Contexto Temporal de hoje.
      - Hora: OBRIGATORIAMENTE no formato HH:MM (padrão 24h). 
      - Título: Seja direto, removendo termos como "marcar", "agendar", "lembrar de".
      
      Exemplos de Saída Esperada:
      - Entrada: "evento dia 25 as 9 horas"
      -> titulo: "evento", data: "YYYY-MM-25", hora: "09:00"
      
      - Entrada: "reunião de alinhamento quarta as 15h"
      -> titulo: "reunião de alinhamento", data: "YYYY-MM-DD" (calculado), hora: "15:00"
      
      - Entrada: "almoçar com cliente meio dia amanhã"
      -> titulo: "almoço com cliente", data: "YYYY-MM-DD" (dia seguinte), hora: "12:00"`,
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
    
    const msgErro = String(error.message || '').toLowerCase();
    
    // Detecta se o erro foi causado por falta de tokens/cota
    if (msgErro.includes('quota') || msgErro.includes('rate limit') || msgErro.includes('429')) {
      return NextResponse.json(
        { erro: '⚠️ Limite gratuito da IA atingido. Tente novamente em 1 minuto.' }, 
        { status: 429 }
      );
    }

    return NextResponse.json({ erro: 'Falha interna no servidor.' }, { status: 500 });
  }
}