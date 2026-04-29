"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-6 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10" />

      <main className="flex flex-col items-center justify-center max-w-4xl w-full text-center z-10 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-slate-300 mb-4">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>A Revolutionary Learning Experience</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Explain to <span className="text-primary-500">Win.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Flip the classroom. You don't answer questions—you teach the AI. 
            Prove your mastery by explaining complex concepts with clarity and structure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-3xl"
        >
          {[
            {
              icon: Brain,
              title: "Test Understanding",
              desc: "Move beyond memorization. True mastery is the ability to teach.",
            },
            {
              icon: Target,
              title: "AI Judgment",
              desc: "Our AI evaluates your explanation for clarity, structure, and correctness.",
            },
            {
              icon: Sparkles,
              title: "Win by Teaching",
              desc: "If the AI 'understands' your explanation, you win the game.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 text-center">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/game"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 hover:bg-primary-500"
          >
            Start Teaching
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
