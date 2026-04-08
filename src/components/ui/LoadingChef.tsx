"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { useEffect, useState } from "react";

const loadingPhrases = [
  "Chopping virtual onions...",
  "Consulting the AI foodie...",
  "Balancing the flavors...",
  "Plating the pixels...",
  "Simmering byte-sized ideas...",
];

export function LoadingChef() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-primary to-accent p-6 rounded-3xl text-white shadow-2xl relative"
      >
        <ChefHat size={48} />
        
        {/* Animated steam */}
        <motion.div
          animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="absolute -top-4 left-1/4 w-2 h-8 bg-white/40 rounded-full blur-[2px]"
        />
        <motion.div
          animate={{ y: [-10, -40], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          className="absolute -top-2 left-1/2 w-3 h-10 bg-white/40 rounded-full blur-[2px]"
        />
        <motion.div
          animate={{ y: [-10, -25], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
          className="absolute -top-3 right-1/4 w-2 h-6 bg-white/40 rounded-full blur-[2px]"
        />
      </motion.div>

      <div className="h-8 overflow-hidden relative w-64 flex justify-center">
        <motion.p
          key={phraseIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-foreground/80 font-medium absolute"
        >
          {loadingPhrases[phraseIndex]}
        </motion.p>
      </div>
    </div>
  );
}
