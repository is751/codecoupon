import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Zap,
  AlertCircle,
  Loader2,
  Bot,
  User,
} from 'lucide-react';
import { Coupon, StoreInfo } from '../types/coupon';
import { getExpiryInfo } from '../utils/expiry';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

type ChatModelOption = 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

interface SavingsChatWidgetProps {
  coupons: Coupon[];
  stores: Record<string, StoreInfo>;
}

const STARTER_PROMPTS = [
  'What are the biggest discounts today?',
  'Which coupons expire soonest?',
  'Do you have any tech or hosting promo codes?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: "Hi! I'm your CodeCoupon Savings Assistant. Ask me about verified promo codes, expiring deals, store discounts, or ways to save on your next purchase.",
};

/**
 * Safely renders plain text with lightweight **bold** emphasis using React elements only.
 */
function renderFormattedLine(line: string, lineKey: number) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span key={lineKey} className="block min-h-[1em]">
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}

export const SavingsChatWidget: React.FC<SavingsChatWidgetProps> = ({
  coupons,
  stores,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ChatModelOption>('gemini-4-hydrogen');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build concise, live catalog summary so the assistant recommends real verified offers & remaining days
  const catalogContext = useMemo(() => {
    const activeOffers = coupons
      .filter((c) => c.verified)
      .slice(0, 25)
      .map((c) => {
        const exp = getExpiryInfo(c.expiryDate);
        const expirySummary = exp
          ? `Expires ${exp.formattedDate} (${exp.label})`
          : 'Ongoing / No expiry date';
        const codeSummary = c.isDeal
          ? 'Instant Direct Deal (no code needed)'
          : `Code: ${c.code || 'N/A'}`;
        return `- ${c.store} | ${c.discountBadge} | ${c.title} | ${codeSummary} | Category: ${c.category} | ${expirySummary}`;
      });

    const storeNames = Object.values(stores)
      .map((s) => `${s.name} (${s.bestDiscount})`)
      .slice(0, 20)
      .join(', ');

    return `Partner Stores: ${storeNames}\nActive Verified Offers:\n${activeOffers.join('\n')}`;
  }, [coupons, stores]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (textToSend: string, isRetry = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMsg(null);
    setLastFailedPrompt(null);

    // Exclude static welcome greeting from API history; keep real conversation turns
    const conversationTurns = messages.filter((m) => m.id !== 'welcome');
    const historyPayload = isRetry
      ? conversationTurns.slice(0, -1).map((m) => ({ role: m.role, text: m.text }))
      : conversationTurns.map((m) => ({ role: m.role, text: m.text }));

    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          model: selectedModel,
          catalogContext,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errText =
          typeof data?.error === 'string' && data.error.trim()
            ? data.error
            : `Request failed with status ${res.status}.`;
        setErrorMsg(errText);
        setLastFailedPrompt(trimmed);
        return;
      }

      const replyText =
        typeof data?.reply === 'string' && data.reply.trim()
          ? data.reply.trim()
          : 'No response generated.';

      const assistantMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        modelUsed: data?.model || selectedModel,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setErrorMsg('Unable to reach the chat server. Please check your connection and try again.');
      setLastFailedPrompt(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[78vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200"
          role="dialog"
          aria-label="CodeCoupon Savings Assistant"
        >
          {/* Top Header */}
          <div className="bg-[#0B0F17] text-white px-4 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#FA5A00] text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold font-heading text-white truncate">
                  Savings Assistant
                </h2>
                <p className="text-[11px] text-slate-400 truncate">
                  Deals, promo codes & expiry help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Model speed toggle */}
              <button
                type="button"
                onClick={() =>
                  setSelectedModel((prev) =>
                    prev === 'gemini-4-hydrogen'
                      ? 'gemini-3.1-flash-lite'
                      : 'gemini-4-hydrogen'
                  )
                }
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-orange-500/20 text-[#FF6600] border-orange-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Switch response mode between Balanced and Fast"
              >
                <Zap className="w-3 h-3" />
                <span>{selectedModel === 'gemini-4-hydrogen' ? 'Balanced' : 'Fast'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="New conversation"
                aria-label="New conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-[#FF6600] text-white'
                        : 'bg-[#0B0F17] text-[#FF6600] border border-slate-800'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#FF6600] to-[#FA5A00] text-white rounded-tr-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                    }`}
                  >
                    <div className="space-y-1 break-words">
                      {msg.text.split('\n').map((line, i) => renderFormattedLine(line, i))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Starter Prompt Suggestions when thread is fresh */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Try asking:
                </span>
                <div className="flex flex-col gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs font-medium text-slate-700 hover:text-orange-700 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Bubble */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0B0F17] text-[#FF6600] border border-slate-800 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6600]" />
                  <span>Finding the best deals...</span>
                </div>
              </div>
            )}

            {/* Real Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
                {lastFailedPrompt && (
                  <button
                    type="button"
                    onClick={() => sendMessage(lastFailedPrompt, true)}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    Retry last message
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask about promo codes, stores, or deals..."
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-[#FF6600] to-[#FA5A00] hover:from-[#FA5A00] hover:to-[#E55000] text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#0B0F17] hover:bg-slate-900 text-white border border-slate-700/80 shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer group"
        aria-label={isOpen ? 'Close Savings Assistant' : 'Open Savings Assistant'}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#FF6600] to-[#FA5A00] flex items-center justify-center text-white">
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="text-xs font-bold font-heading tracking-wide pr-1">
          {isOpen ? 'Close Chat' : 'Deal Assistant'}
        </span>
      </button>
    </div>
  );
};
