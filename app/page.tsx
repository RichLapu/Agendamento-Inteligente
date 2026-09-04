'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Toaster, toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [eventos, setEventos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  
  // Estados de navegação do calendário
  const [dataCalendario, setDataCalendario] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<any>('month');
  
  // Estados para o Modal
  const [eventoEditando, setEventoEditando] = useState<any>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editData, setEditData] = useState('');
  const [editHora, setEditHora] = useState('');

  const buscarEventos = async () => {
    const res = await fetch('/api/eventos');
    const dados = await res.json();
    
    const eventosFormatados = dados.map((ev: any) => {
      const dataInicio = new Date(`${ev.data}T${ev.hora}:00`);
      
      let dataTermino = dataInicio;
      if (ev.dataFim && ev.horaFim) {
        dataTermino = new Date(`${ev.dataFim}T${ev.horaFim}:00`);
      }

      return {
        id: ev.id,
        title: `${ev.hora} - ${ev.titulo}`,
        start: dataInicio,
        end: dataTermino,
        dadosOriginais: ev
      };
    });
    
    setEventos(eventosFormatados);
  };

  useEffect(() => { buscarEventos(); }, []);

  const enviarAgendamento = () => {
    if (!prompt) return;
    setCarregando(true);

    const promessaAgendamento = async () => {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) throw new Error('Falha na IA');
      
      await buscarEventos();
      setPrompt('');
      setCarregando(false);
    };

    toast.promise(promessaAgendamento(), {
      loading: '✨ A IA está organizando sua agenda...',
      success: 'Compromisso agendado com sucesso!',
      error: () => {
        setCarregando(false);
        return 'Erro ao processar o agendamento.';
      },
    });
  };

  const deletarEvento = async (id: number) => {
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    setEventoEditando(null);
    buscarEventos();
  };

  const salvarEvento = async () => {
    if (eventoEditando.id === 'novo') {
      await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editTitulo, data: editData, hora: editHora }),
      });
    } else {
      await fetch(`/api/eventos/${eventoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editTitulo, data: editData, hora: editHora }),
      });
    }
    setEventoEditando(null);
    buscarEventos();
  };

  const abrirModal = (eventoSelecionado: any) => {
    setEventoEditando(eventoSelecionado);
    setEditTitulo(eventoSelecionado.dadosOriginais.titulo);
    setEditData(eventoSelecionado.dadosOriginais.data);
    setEditHora(eventoSelecionado.dadosOriginais.hora);
  };

  const abrirModalNovoEvento = (slotInfo: any) => {
    const data = slotInfo.start;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    
    setEventoEditando({ id: 'novo' });
    setEditTitulo('');
    setEditData(`${ano}-${mes}-${dia}`);
    setEditHora(slotInfo.slots.length > 1 ? '00:00' : String(data.getHours()).padStart(2, '0') + ':00');
  };

  const estilizarEvento = (evento: any) => {
    let backgroundColor = '#10b981'; // Verde (Pessoal / Default)
    if (evento.dadosOriginais?.categoria === 'trabalho') backgroundColor = '#3b82f6'; // Azul
    if (evento.dadosOriginais?.categoria === 'estudos') backgroundColor = '#8b5cf6'; // Roxo

    return { style: { backgroundColor, color: '#fff', border: 'none', borderRadius: '6px' } };
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <Toaster position="bottom-right" richColors />
      
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Cabeçalho */}
        <div className="text-center space-y-2 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
            Agendamento Inteligente
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Descreva seu compromisso e deixe a IA organizar sua agenda
          </p>
        </div>

        {/* Área da IA */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">✨</span>
            <input 
              className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
              placeholder='Ex: "Prova final da UniCesumar quinta-feira das 19h as 22h30"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarAgendamento()}
            />
          </div>
          <button 
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            onClick={enviarAgendamento}
            disabled={carregando || prompt.trim().length === 0}
            suppressHydrationWarning
          >
            {carregando ? 'Aguarde...' : 'Agendar'}
          </button>
        </div>

        {/* Container do Calendário */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[700px]">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            messages={{ next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", agenda: "Agenda" }}
            onSelectEvent={abrirModal}
            date={dataCalendario}
            onNavigate={(novaData) => setDataCalendario(novaData)}
            view={visualizacao}
            onView={(novaVisualizacao) => setVisualizacao(novaVisualizacao)}
            selectable={true}
            onSelectSlot={abrirModalNovoEvento}
            eventPropGetter={estilizarEvento}
          />
        </div>
      </div>

      {/* MODAL MISTO (CRIAR/EDITAR) */}
      {eventoEditando && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 text-slate-800 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">
              {eventoEditando.id === 'novo' ? 'Novo Compromisso' : 'Editar Compromisso'}
            </h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Título</label>
              <input className="border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Data</label>
              <input className="border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="date" value={editData} onChange={(e) => setEditData(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Início</label>
              <input className="border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="time" value={editHora} onChange={(e) => setEditHora(e.target.value)} />
            </div>
            
            <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
              <div>
                {eventoEditando.id !== 'novo' && (
                  <button onClick={() => deletarEvento(eventoEditando.id)} className="text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                    Excluir
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEventoEditando(null)} className="text-slate-500 font-semibold hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={salvarEvento} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}