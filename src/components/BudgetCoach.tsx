import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Expense, SavingsGoal, ChatMessage } from "../types";
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface BudgetCoachProps {
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  currency: string;
}

export default function BudgetCoach({ expenses, savingsGoals, currency }: BudgetCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("smartspend_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello there! I am **SmartSpend AI**, your personal budget advisor and financial coach.

I've automatically connected to your current transaction logs and active savings goals. Ask me anything, or try some of these topics:
- **Analyze my spends**: I'll review where your money is going and highlight optimization opportunities.
- **Save on categories**: Let's find practical ways to cut back on groceries, dining out, or shopping.
- **Design a budget**: I can draw up a customized 50/30/20 or custom envelope budget tailored to your monthly income.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("smartspend_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.filter((m) => m.id !== "welcome").map((m) => ({
            role: m.role,
            content: m.content,
          })),
          expenses,
          savingsGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the Financial Coach service.");
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: data.text || "I was unable to formulate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear your conversation history with SmartSpend AI?")) {
      const initialWelcome: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello there! I am **SmartSpend AI**, your personal budget advisor and financial coach.

I've automatically connected to your current transaction logs and active savings goals. Ask me anything, or try some of these topics:
- **Analyze my spends**: I'll review where your money is going and highlight optimization opportunities.
- **Save on categories**: Let's find practical ways to cut back on groceries, dining out, or shopping.
- **Design a budget**: I can draw up a customized 50/30/20 or custom envelope budget tailored to your monthly income.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initialWelcome]);
      setError(null);
    }
  };

  const suggestions = [
    { label: "Analyze my Spends", prompt: "Please analyze my current spending history and tell me where I am spending the most and how to optimize it." },
    { label: "50/30/20 Budget Plan", prompt: "Create a customized 50/30/20 budget recommendation based on my current income and spending habits." },
    { label: "Tips to Save Money", prompt: "Give me 5 simple, creative and practical habits to reduce my daily miscellaneous spending." },
    { label: "Goal Saving Strategy", prompt: "I want to reach my active savings goals faster. What are the best methods to squeeze more savings out of my current budget?" }
  ];

  return (
    <div className="flex flex-col h-full bg-bg-card dark:bg-dark-bg-card rounded-2xl border border-border-card dark:border-dark-border shadow-[0_2px_12px_rgba(43,35,32,0.06)] hover:shadow-[0_4px_20px_rgba(43,35,32,0.1)] overflow-hidden transition-all duration-300">
      {/* Coach Header: Consistent pattern with light blue badge */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-border-soft dark:border-dark-border bg-bg-card dark:bg-dark-bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/10 dark:bg-accent-blue/20 text-accent-blue border border-accent-blue/10 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-text-primary dark:text-dark-text-primary flex items-center gap-2 font-display">
              SmartSpend Financial Coach
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-semibold">{expenses.length} spends logged</p>
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted dark:bg-dark-text-muted" />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-accent-green/10 text-accent-green border border-accent-green/15">
                <span className="w-1 h-1 rounded-full bg-accent-green animate-ping" />
                Live AI
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-[10px] font-extrabold text-text-secondary hover:text-accent-coral dark:text-dark-text-secondary dark:hover:text-accent-coral flex items-center gap-1 p-2 rounded-lg hover:bg-bg-app dark:hover:bg-dark-bg-app transition-colors"
          title="Reset Coach Memory"
          id="btn-clear-coach"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Memory
        </button>
      </div>

      {/* Chat Messages Stage (Light Chat Surface) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-card dark:bg-dark-bg-card min-h-0" id="chat-messages-container">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar Icon with Gradient Outline for Bot */}
              <div className="flex-shrink-0">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-bg-card-alt dark:bg-dark-bg-app text-accent-coral flex items-center justify-center border border-border-soft dark:border-dark-border shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-[1.5px] rounded-full bg-accent-gradient shadow-xs">
                    <div className="w-[29px] h-[29px] rounded-full bg-white dark:bg-dark-bg-card text-accent-coral flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent-gradient text-white rounded-tr-none font-semibold shadow-xs"
                    : "bg-bg-card-alt dark:bg-dark-bg-card/45 text-text-primary dark:text-dark-text-primary rounded-tl-none border border-border-soft dark:border-dark-border"
                }`}>
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.content.split("\n").map((line, lineIdx) => {
                      let processed = line;
                      
                      // Bold formatting **text**
                      if (processed.includes("**")) {
                        const parts = processed.split("**");
                        return (
                          <p key={lineIdx}>
                            {parts.map((part, partIdx) => 
                              partIdx % 2 === 1 ? <strong key={partIdx} className="font-extrabold text-accent-coral dark:text-accent-coral">{part}</strong> : part
                            )}
                          </p>
                        );
                      }

                      // Bullet lists starting with - or *
                      if (processed.trim().startsWith("- ") || processed.trim().startsWith("* ")) {
                        const cleanLine = processed.trim().replace(/^[-*]\s+/, "");
                        return (
                          <ul key={lineIdx} className="list-disc pl-4 my-0.5">
                            <li>{cleanLine}</li>
                          </ul>
                        );
                      }

                      return <p key={lineIdx}>{processed}</p>;
                    })}
                  </div>
                </div>
                <span className={`text-[9px] text-text-muted dark:text-dark-text-muted ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mr-auto max-w-[80%]"
            >
              <div className="p-[1.5px] rounded-full bg-accent-gradient animate-pulse">
                <div className="w-[29px] h-[29px] rounded-full bg-white dark:bg-dark-bg-card text-accent-coral flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3 bg-bg-card-alt dark:bg-dark-bg-card/45 rounded-2xl rounded-tl-none border border-border-soft dark:border-dark-border flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-accent-coral animate-spin" />
                  <span className="text-[11px] font-bold text-text-secondary dark:text-dark-text-secondary animate-pulse">Formulating smart advice...</span>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-accent-coral text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-accent-coral" />
              <span className="flex-1">{error}</span>
              <button
                onClick={() => handleSendMessage(messages[messages.length - 1]?.content || "")}
                className="px-2.5 py-1 bg-accent-coral text-white font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                id="btn-retry-chat"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts - Rounded pill buttons with hover lift + coral border */}
      {messages.length === 1 && (
        <div className="px-5 py-2.5 bg-bg-card dark:bg-dark-bg-card border-t border-border-soft dark:border-dark-border overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2" id="quick-prompts-tray">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug.prompt)}
              className="inline-block text-xs font-bold rounded-full border border-accent-coral/30 hover:border-accent-coral px-4 py-1.5 bg-white dark:bg-dark-bg-card hover:-translate-y-0.5 hover:shadow-xs transition-all text-text-secondary hover:text-accent-coral dark:text-dark-text-secondary dark:hover:text-accent-coral cursor-pointer"
              id={`quick-prompt-${i}`}
            >
              {sug.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Area (Rounded Pill Form) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-border-soft dark:border-dark-border bg-bg-card dark:bg-dark-bg-card flex gap-2"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PennyWise Coach: 'Design a 50/30/20 plan...'"
          disabled={loading}
          className="flex-1 px-5 py-2.5 text-xs rounded-full bg-bg-app dark:bg-dark-bg-app border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-coral/20 focus:border-accent-coral text-text-primary dark:text-dark-text-primary placeholder-text-muted transition-all disabled:opacity-50"
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-accent-gradient hover:opacity-90 text-white rounded-full transition-all shadow-md shadow-accent-coral/10 hover:shadow-accent-coral/25 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:scale-105"
          id="btn-chat-send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
