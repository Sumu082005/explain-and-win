"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, RefreshCcw, Target, Edit2, BookOpen } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";

interface ScoreDetail {
  score: number;
  explanation: string;
}

interface EvaluationResult {
  clarity: ScoreDetail;
  structure: ScoreDetail;
  correctness: ScoreDetail;
  final_score: number;
  mistakes: string[];
  improved_explanation: string;
  win: boolean;
  error?: string;
}

export default function GameArena() {
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    if (result?.win) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result]);

  const [concept, setConcept] = useState("");
  const [ragContext, setRagContext] = useState("");
  const [persona, setPersona] = useState("Regular person (standard explanation)");
  const [isConceptSet, setIsConceptSet] = useState(false);
  
  const [studyReport, setStudyReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          concept, 
          clean_text: explanation,
          context: ragContext || "No specific textbook context provided.",
          persona
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, context: ragContext, persona }),
      });
      const data = await res.json();
      if (data.report) {
        setStudyReport(data.report);
      }
    } catch (error) {
      console.error("Report generation failed", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

      <header className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/50 backdrop-blur-md z-10">
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-primary-500">Lumina</span> Explain-to-Win
        </Link>
        {isConceptSet && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex gap-4">
              <span>Topic: <span className="text-primary-400 font-medium">{concept}</span></span>
              <span className="text-white/20">|</span>
              <span>Audience: <span className="text-primary-400 font-medium">{persona}</span></span>
            </div>
            <button 
              onClick={() => {
                setIsConceptSet(false);
                setResult(null);
                setExplanation("");
                setStudyReport(null);
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 transition-colors"
              title="Change Setup"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col z-10">
        {!isConceptSet ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Topic</h2>
              <p className="text-slate-400 mb-8">What concept would you like to teach the AI today?</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (concept.trim()) setIsConceptSet(true);
                }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Concept Name</label>
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g. Recursion, Photosynthesis..."
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience (Persona)</label>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Regular person (standard explanation)">👤 Regular person (standard explanation)</option>
                    <option value="5-year-old (no jargon)">👶 5-year-old (no jargon)</option>
                    <option value="CEO (business relevance)">💼 CEO (business relevance)</option>
                    <option value="Skeptical peer ('but why?' loop)">😈 Skeptical peer ("but why?" loop)</option>
                    <option value="Interviewer (clear + structured)">🎤 Interviewer (clear + structured)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Textbook Context (RAG Input) <span className="text-slate-500 font-normal">- Optional</span></label>
                  <textarea
                    value={ragContext}
                    onChange={(e) => setRagContext(e.target.value)}
                    placeholder="Paste the 'ground truth' textbook definition here. The AI will use this to strictly judge correctness."
                    className="w-full h-24 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!concept.trim()}
                  className="w-full py-3 mt-4 rounded-xl bg-primary-600 text-white font-medium disabled:opacity-50 hover:bg-primary-500 transition-colors"
                >
                  Start Game
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 w-full h-full">
        {/* Left Column: Chat / Input Area */}
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-4 custom-scrollbar">
            {/* AI Prompt */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 border border-primary-500/30">
                <Bot className="w-5 h-5 text-primary-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-slate-300 leading-relaxed shadow-lg">
                <p>
                  Hey! I'm trying to learn about <strong className="text-white">{concept}</strong>. 
                  Can you explain it to me? Remember, I am acting as a <strong>{persona}</strong>!
                </p>
              </div>
            </motion.div>

            {/* User Explanation (if submitted) */}
            {explanation && (isSubmitting || result) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-tr-sm p-4 text-slate-200 leading-relaxed shadow-lg">
                  <p className="whitespace-pre-wrap">{explanation}</p>
                </div>
              </motion.div>
            )}

            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-primary-400 pl-14"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium animate-pulse">AI is thinking...</span>
              </motion.div>
            )}
          </div>

          {/* Input Form */}
          {(!isSubmitting && !result) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto"
            >
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Type your explanation here..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={!explanation.trim()}
                  className="absolute bottom-4 right-4 p-3 rounded-xl bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto"
            >
              <button
                onClick={() => {
                  setResult(null);
                  setExplanation("");
                }}
                className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Another Explanation
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Column: Score Meters & Feedback */}
        <div className="flex flex-col justify-center">
          {isGeneratingReport ? (
             <div className="h-full border border-primary-500/30 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-primary-950/20">
                <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-6" />
                <h3 className="text-xl font-medium text-primary-300 mb-2">Generating Practice Report...</h3>
                <p className="text-primary-400/60 text-sm max-w-sm">
                  The AI is analyzing your chosen topic and audience to create a personalized study guide.
                </p>
             </div>
          ) : studyReport ? (
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-8 rounded-3xl border relative overflow-hidden bg-blue-950/20 border-blue-500/30 h-full flex flex-col"
             >
               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                   <BookOpen className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-white">Your Personal Study Guide</h2>
                   <p className="text-blue-300 text-sm">Review this before trying again.</p>
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-slate-300 prose prose-invert prose-blue max-w-none">
                 <ReactMarkdown>{studyReport}</ReactMarkdown>
               </div>
               
               <button
                 onClick={() => {
                   setStudyReport(null);
                 }}
                 className="w-full py-4 mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 font-medium"
               >
                 <RefreshCcw className="w-5 h-5" />
                 I'm Ready to Explain
               </button>
             </motion.div>
          ) : result ? (
            result.error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl border relative overflow-hidden bg-red-950/20 border-red-500/30 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-red-400">Oops, something went wrong.</h2>
                <p className="text-slate-300">{result.error}</p>
                <p className="text-slate-500 text-sm mt-4">Please try submitting your explanation again.</p>
              </motion.div>
            ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-3xl border relative overflow-hidden ${
                result.win 
                  ? "bg-green-950/20 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]" 
                  : "bg-red-950/20 border-red-500/30"
              }`}
            >
              {result.win && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50" />
              )}
              
              <div className="text-center mb-10">
                <h2 className={`text-4xl font-bold mb-2 ${result.win ? "text-green-400" : "text-red-400"}`}>
                  {result.win ? "You Win!" : "Try Again"}
                </h2>
                <p className="text-slate-400">
                  {result.win 
                    ? "The AI completely understood your explanation." 
                    : "The AI is still a bit confused. Look at the scores to see where you can improve."}
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <ScoreMeter label="Clarity" score={result.clarity.score} color="bg-blue-500" tooltip={result.clarity.explanation} />
                <ScoreMeter label="Structure" score={result.structure.score} color="bg-purple-500" tooltip={result.structure.explanation} />
                <ScoreMeter label="Correctness" score={result.correctness.score} color="bg-amber-500" tooltip={result.correctness.explanation} />
              </div>

              <div className="space-y-4 text-left">
                {result.mistakes && result.mistakes.length > 0 && result.mistakes[0] !== "No major mistakes found." && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20">
                    <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Misconceptions Found</h4>
                    <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                      {result.mistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                    </ul>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-primary-950/20 border border-primary-500/20">
                  <h4 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-2">How the AI would explain it</h4>
                  <p className="text-slate-300 leading-relaxed text-sm">"{result.improved_explanation}"</p>
                </div>
              </div>
            </motion.div>
            )
          ) : (
             <div className="h-full border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/[0.02]">
                <div className="max-w-xs space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300">Awaiting Your Input</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Submit your explanation to see how well you score in Clarity, Structure, and Correctness.
                  </p>
                  
                  <div className="pt-6 border-t border-white/10 w-full">
                    <button
                      onClick={generateReport}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Generate Practice Report
                    </button>
                    <p className="text-slate-500 text-xs mt-3">
                      Need help preparing? Get a custom study guide for your target audience.
                    </p>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
        )}
      </main>
    </div>
  );
}

function ScoreMeter({ label, score, color, tooltip }: { label: string; score: number; color: string; tooltip?: string }) {
  return (
    <div className="group relative">
      <div className="flex justify-between items-end mb-2">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-xl font-bold text-white">{score}<span className="text-sm text-slate-500">/100</span></span>
      </div>
      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden cursor-help">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
        />
      </div>
      {tooltip && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-2 left-0 z-20 w-full p-2 bg-slate-800 text-xs text-slate-200 rounded shadow-lg pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
}
