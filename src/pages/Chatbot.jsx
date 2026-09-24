import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { askChatbot } from "../api/client";

const SUGGESTIONS = [
  "What does enhanced due diligence mean?",
  "When should a suspicious transaction be escalated?",
  "What is the PMLA reporting threshold?",
];

function sourceLabel(source) {
  if (typeof source === "string") return source;
  return source?.title || source?.name || source?.url || "Regulation source";
}

export default function Chatbot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function submitQuestion(event) {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setQuestion("");

    try {
      const response = await askChatbot(trimmed);
      const isPlaceholder = response.answer?.toLowerCase().includes("will be active");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.answer || "No answer was returned.",
          sources: response.sources || [],
          placeholder: isPlaceholder,
          demo: response.demo,
        },
      ]);
    } catch (requestError) {
      const message = requestError.response?.data?.detail || "The assistant could not answer right now.";
      setMessages((current) => [...current, { role: "assistant", text: message, error: true }]);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-violet-600 p-3 text-white"><MessageCircle size={22} /></div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">Compliance assistant</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ask questions about compliance rules and get answers with source references.</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800"><div className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"><Bot size={19} /></div><div><h2 className="font-semibold text-slate-900 dark:text-white">Regulation Q&A</h2><p className="text-xs text-slate-500 dark:text-slate-400">Answers should be reviewed before making a formal filing or decision.</p></div></div>

          <div className="min-h-[420px] space-y-5 bg-slate-50/70 p-5 dark:bg-slate-950/30">
            {messages.length === 0 && <div className="flex min-h-[300px] flex-col items-center justify-center text-center"><Bot size={38} className="text-violet-500" /><h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">How can I help?</h3><p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">Start with a question below, or choose a common question to test the flow.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-violet-300">{suggestion}</button>)}</div></div>}

            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}><p className="whitespace-pre-line text-sm leading-6">{message.text}</p>{message.placeholder && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">The backend endpoint is connected, but its RAG implementation is still a placeholder in this checkout.</p>}{message.demo && <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">Demo response — the backend service is not currently available.</p>}{message.sources?.length > 0 && <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p><ul className="mt-2 space-y-1">{message.sources.map((source, sourceIndex) => <li key={`${sourceLabel(source)}-${sourceIndex}`} className="text-xs text-blue-700 dark:text-blue-300">{sourceLabel(source)}</li>)}</ul></div>}</div></div>)}
            {submitting && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Checking the compliance knowledge base…</div>}
          </div>

          <form onSubmit={submitQuestion} className="flex gap-3 border-t border-slate-200 p-5 dark:border-slate-800"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a compliance question…" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-950" /><button disabled={!question.trim() || submitting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> Ask</button></form>
        </section>
      </div>
    </Layout>
  );
}
