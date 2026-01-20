import { motion } from "framer-motion";

export function AudioVisualizer({ isListening }: { isListening: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-[200px]">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-full bg-primary"
          animate={{
            height: isListening ? [10, 40, 15, 50, 20] : 8,
            opacity: isListening ? 1 : 0.3,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
