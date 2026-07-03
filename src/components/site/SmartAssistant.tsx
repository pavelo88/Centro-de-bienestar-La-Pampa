'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, User } from 'lucide-react';
import { askSiteAssistant } from '@/app/actions/ai-actions';
import { cn } from '@/lib/utils';
// import { useFirebase } from '@/firebase'; // Opcional, si queremos leer auth
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual de La Pampa. ¿En qué te puedo ayudar hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Por ahora enviamos 'Visitante' o 'Residente' quemado, luego lo conectamos al rol real de Firebase
      const role = pathname.startsWith('/portal') ? 'Residente' : 'Visitante';
      const response = await askSiteAssistant(userMessage, pathname, role);
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Hubo un error de conexión. Intenta de nuevo más tarde.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-full">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Asistente Virtual</h3>
                  <p className="text-xs text-muted-foreground">La Pampa Concierge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 backdrop-blur-sm">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex max-w-[85%]",
                    msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
                  )}
                >
                  <div className={cn(
                    "rounded-2xl p-3 text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex max-w-[85%] mr-auto justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none p-3 text-sm shadow-sm flex items-center gap-2">
                    <span className="animate-pulse">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-background border-t border-border">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-secondary/50 border border-border rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
