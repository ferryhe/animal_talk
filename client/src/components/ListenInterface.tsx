import { useState, useRef, useEffect } from "react";
import { Mic, History, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TranslationResult } from "@/components/TranslationResult";
import { getRandomResult, SoundDefinition } from "@/lib/sounds";
import { getRandomCatResult } from "@/lib/catSounds";
import guineaPigMascot from "@assets/generated_images/cute_guinea_pig_mascot_listening_with_headphones.png";
import catMascot from "@assets/generated_images/cute_cat_mascot_with_headphones.png";

interface ListenInterfaceProps {
  language: 'en' | 'zh';
  animal: 'guinea_pig' | 'cat';
}

export function ListenInterface({ language, animal }: ListenInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<SoundDefinition[] | null>(null);
  const [history, setHistory] = useState<SoundDefinition[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const mascotImage = animal === 'guinea_pig' ? guineaPigMascot : catMascot;
  const animalName = animal === 'guinea_pig' 
    ? (language === 'en' ? 'piggie' : '豚鼠')
    : (language === 'en' ? 'cat' : '猫咪');

  const startListening = () => {
    if (isListening) return;
    
    setResults(null);
    setIsListening(true);
    
    // Simulate listening duration (2-4 seconds)
    const duration = Math.random() * 2000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setIsListening(false);
      const newResults = animal === 'guinea_pig' ? getRandomResult() : getRandomCatResult();
      setResults(newResults);
    }, duration);
  };

  const stopListening = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsListening(false);
  };

  const handleConfirm = (sound: SoundDefinition | null) => {
    if (sound) {
      setHistory(prev => [sound, ...prev]);
    } else {
      setHistory(prev => prev.slice(1));
    }
  };

  // Clear results and history when animal changes
  useEffect(() => {
    setResults(null);
    setHistory([]);
  }, [animal]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8 min-h-[60vh]">
      
      {/* Mascot Area */}
      <motion.div 
        layout
        className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key={`mascot-${animal}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 h-full w-full opacity-20" />
              <img 
                src={mascotImage} 
                alt={animal === 'guinea_pig' ? "Cute Guinea Pig" : "Cute Cat"} 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          ) : (
            <motion.div
              key="results-spacer"
              className="h-20"
            />
          )}
        </AnimatePresence>

        {/* Listening Ripple Effect */}
        {isListening && (
          <div className="absolute inset-0 z-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{
                  scale: [1, 1.5],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Action Area */}
      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            key="action"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'en' ? `What's your ${animalName} saying?` : `你的${animalName}在说什么？`}
              </h1>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? "Tap the button to listen and translate" 
                  : "点击按钮开始聆听并翻译"}
              </p>
            </div>

            <div className="h-16 flex items-center justify-center w-full">
              {isListening ? (
                <AudioVisualizer isListening={true} />
              ) : (
                <div className="h-16" /> 
              )}
            </div>

            <Button
              size="lg"
              className={`
                w-24 h-24 rounded-full shadow-xl transition-all duration-300
                flex items-center justify-center
                ${isListening 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                  : "bg-primary hover:bg-primary/90 hover:scale-105"
                }
              `}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening ? (
                <X className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </Button>
            
            {isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary font-medium"
              >
                {language === 'en' ? "Listening..." : "正在聆听..."}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center gap-6"
          >
            <div className="flex items-center justify-between w-full max-w-md">
              <h2 className="text-xl font-bold">
                {language === 'en' ? "Analysis Complete" : "分析完成"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setResults(null)}>
                {language === 'en' ? "Try Again" : "重试"}
              </Button>
            </div>

            <TranslationResult 
              results={results} 
              language={language}
              onConfirm={handleConfirm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* History / Recent Translations */}
      {history.length > 0 && !isListening && !results && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mt-12 space-y-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground px-2">
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'en' ? "Recent Translations" : "最近翻译"}
            </span>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm divide-y divide-border">
            {history.slice(0, 3).map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{language === 'en' ? item.name : item.name_zh}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {language === 'en' ? item.translations.en : item.translations.zh}
                  </p>
                </div>
                <div className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                  {language === 'en' ? "Confirmed" : "已确认"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
