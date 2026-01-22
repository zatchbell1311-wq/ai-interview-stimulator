"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold tracking-tighter"
      >
        INTERVIEW / <span className="text-red-500">SIMULATOR</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-400 max-w-md text-center"
      >
        Prepare for pressure. Use your voice. Don't panic.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/resume"
          className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          Enter Simulation
        </Link>
      </motion.div>
    </div>
  );
}
