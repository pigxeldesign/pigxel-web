import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ExternalLink, Globe, Search, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { sendNavigatorMessage, ChatMessage, NavigatorSource } from '../lib/navigatorApi';

// ──────────────────────────────────────────────
//  Local UI types
// ──────────────────────────────────────────────

interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: NavigatorSource[];
  isError?: boolean;
}

// ──────────────────────────────────────────────
//  Sub-components
// ──────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-purple-400"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const SourceChip: React.FC<{ source: NavigatorSource }> = ({ source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
               bg-gray-700/60 hover:bg-gray-700 border border-gray-600/50 hover:border-purple-500/60
               text-gray-300 hover:text-white transition-all duration-200 group"
  >
    {source.type === 'web' ? (
      <Globe className="w-3 h-3 text-blue-400 group-hover:text-blue-300" />
    ) : (
      <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
    )}
    {source.name.length > 32 ? source.name.slice(0, 32) + '…' : source.name}
  </a>
);

const MessageBubble: React.FC<{ msg: UiMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center mr-3 mt-1 shadow-lg shadow-purple-900/40">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-last' : ''}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser
            ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-br-md shadow-lg shadow-purple-900/30'
            : msg.isError
              ? 'bg-red-900/30 border border-red-700/40 text-red-300 rounded-bl-md'
              : 'bg-gray-800/70 border border-gray-700/50 text-gray-200 rounded-bl-md backdrop-blur-sm'
            }`}
        >
          {msg.isError && <AlertCircle className="inline w-4 h-4 mr-1.5 mb-0.5" />}
          {msg.content}
        </div>

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.sources.map((s, i) => (
              <SourceChip key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const QuestionCard: React.FC<{ question: string; onClick: () => void }> = ({
  question,
  onClick,
}) => (
  <motion.button
    whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full text-left bg-gray-800/40 border border-gray-700/60 hover:bg-gray-800/70
               rounded-xl p-4 cursor-pointer transition-colors group"
  >
    <div className="flex items-start gap-3">
      <Search className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0 group-hover:text-purple-300" />
      <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors">
        {question}
      </p>
    </div>
  </motion.button>
);

// ──────────────────────────────────────────────
//  Main Page
// ──────────────────────────────────────────────

const POPULAR_QUESTIONS = [
  'Show me NFT marketplaces and art platforms in the directory',
  "What is web3 wallet?",
  'What are the top DeFi lending protocols in your directory?',
  "I keep hearing about 'liquid staking'. Can you explain it and show me a trusted app?",
];

let msgIdCounter = 0;
const newId = () => `msg-${++msgIdCounter}`;

const Web3NavigatorPage: React.FC = () => {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]); // sent to the API
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput('');

      // Append user bubble
      const userUiMsg: UiMessage = { id: newId(), role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userUiMsg]);

      // Build history to send
      const userApiMsg: ChatMessage = { role: 'user', content: trimmed };
      const nextHistory: ChatMessage[] = [...history, userApiMsg];

      setIsLoading(true);

      try {
        const response = await sendNavigatorMessage(nextHistory);

        const assistantUiMsg: UiMessage = {
          id: newId(),
          role: 'assistant',
          content: response.reply,
          sources: response.sources,
        };
        setMessages((prev) => [...prev, assistantUiMsg]);

        // Extend history with both turns
        setHistory([
          ...nextHistory,
          { role: 'assistant', content: response.reply },
        ]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content: `⚠️ ${errorMsg}`,
            isError: true,
          },
        ]);
        // Don't extend history on error so user can retry cleanly
      } finally {
        setIsLoading(false);
        // Refocus input after response
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [history, isLoading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setHistory([]);
    setInput('');
    inputRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="pt-16 min-h-screen flex flex-col">
      {/* ── Header ── */}
      <div className="flex-none">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="relative w-16 h-16">
                <img
                  src="/web3-navigator.png"
                  alt="Web3 Navigator AI"
                  className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.7)]"
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(139, 92, 246, 0)',
                      '0 0 0 14px rgba(139, 92, 246, 0.25)',
                      '0 0 0 0 rgba(139, 92, 246, 0)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Web3 Navigator
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Ask anything. Get real recommendations from the directory — powered by AI.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Chat / Starter area ── */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Empty state — show popular questions */}
          <AnimatePresence>
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 text-center">
                  Popular questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {POPULAR_QUESTIONS.map((q, i) => (
                    <QuestionCard
                      key={i}
                      question={q}
                      onClick={() => sendMessage(q)}
                    />
                  ))}
                </div>

                {/* How it works */}
                <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-xl p-4 text-center mb-8">
                  <div className="flex items-center justify-center mb-2 gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300 font-medium text-sm">How it works</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Web3 Navigator searches the real Pigxel directory using AI tools, then
                    crafts a grounded answer with direct links. Follow-up questions retain
                    context — just keep chatting.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {hasMessages && (
            <div className="pt-4 pb-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center mr-3 shadow-lg shadow-purple-900/40">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700/50 rounded-2xl rounded-bl-md backdrop-blur-sm">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar (sticky bottom) ── */}
      <div className="flex-none sticky bottom-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-800/60 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            {/* Reset button — only when conversation started */}
            <AnimatePresence>
              {hasMessages && (
                <motion.button
                  key="reset"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleReset}
                  title="Start new conversation"
                  className="flex-shrink-0 p-2.5 rounded-xl text-gray-500 hover:text-gray-300
                             hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600
                             transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                id="navigator-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Web3 apps…"
                rows={1}
                disabled={isLoading}
                className="w-full resize-none px-4 py-3 pr-12 bg-gray-800/60 border border-gray-700/60
                           focus:border-purple-500/70 rounded-xl text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-purple-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-sm leading-relaxed transition-all duration-200
                           max-h-36 overflow-y-auto"
                style={{ scrollbarWidth: 'thin' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
                }}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              id="navigator-send-btn"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700
                         hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-900/40
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                         transition-all duration-200 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-600 mt-2">
            <span className="mr-1">⏎</span>to send · Shift+⏎ for new line · Powered by{' '}
            <span className="text-purple-500">OpenRouter</span> +{' '}
            <span className="text-purple-500">Pigxel Directory</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Web3NavigatorPage;