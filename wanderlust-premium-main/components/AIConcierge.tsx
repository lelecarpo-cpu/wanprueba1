
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, Sparkles, X, Loader2, Compass, ArrowRight } from 'lucide-react';
import { RouteModel } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIConcierge: React.FC<{ routes: RouteModel[] }> = ({ routes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy tu guía personal de Wanderlust. ¿Qué tipo de aventura te apetece hoy? Puedo recomendarte rutas gastronómicas, de arte o incluso deportivas.' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      // We provide context about available routes to Gemini
      const routeContext = routes.slice(0, 10).map(r => `- ${r.title}: ${r.description} (${r.category})`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: userMessage,
        config: {
          systemInstruction: `Eres un experto guía turístico de la plataforma Wanderlust. 
          Tu objetivo es recomendar rutas basadas en los intereses del usuario. 
          Sé amable, entusiasta y conciso. 
          Si el usuario pide algo específico, intenta relacionarlo con estas rutas disponibles:\n${routeContext}\n
          Si no hay una coincidencia exacta, describe qué tipo de experiencia podría gustarle.`,
          temperature: 0.7,
        },
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Perdona, me he despistado. ¿Podrías repetir?' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, estoy teniendo problemas técnicos. ¡Inténtalo de nuevo más tarde!' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60] w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group ${isOpen ? 'rotate-90' : ''}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
        <span className="absolute -top-12 right-0 bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          ¿Necesitas ayuda?
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 left-4 md:bottom-28 md:right-8 md:left-auto w-auto md:w-[400px] h-[500px] md:h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[60] flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-brand-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">AI Concierge</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">En línea</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none shadow-md' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span className="text-xs text-slate-400 font-medium">Buscando rutas ideales...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-14 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                className="absolute right-2 w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Potenciado por Gemini 3.0 Flash</p>
          </div>
        </div>
      )}
    </>
  );
};
