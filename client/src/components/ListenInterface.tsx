import { useState, useRef, useEffect } from "react";
import { Mic, History, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TranslationResult } from "@/components/TranslationResult";
import { getRandomGuineaPigResult, SoundDefinition } from "@/lib/guineaPigSounds";
import { getRandomCatResult } from "@/lib/catSounds";
import { getRandomDogResult } from "@/lib/dogSounds";
import guineaPigMascot from "@assets/generated_images/cute_guinea_pig_mascot_listening_with_headphones.png";
import catMascot from "@assets/generated_images/cute_cat_mascot_with_headphones.png";
import dogMascot from "@assets/generated_images/cute_dog_mascot_with_headphones.png";

interface ListenInterfaceProps {
  language: 'en' | 'zh';
  animal: 'guinea_pig' | 'cat' | 'dog';
}

const ANIMAL_CONFIG = {
  guinea_pig: { mascot: guineaPigMascot, name_en: 'piggie', name_zh: '豚鼠', getResults: getRandomGuineaPigResult },
  cat: { mascot: catMascot, name_en: 'cat', name_zh: '猫咪', getResults: getRandomCatResult },
  dog: { mascot: dogMascot, name_en: 'dog', name_zh: '狗狗', getResults: getRandomDogResult },
};

export function ListenInterface({ language, animal }: ListenInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<SoundDefinition[] | null>(null);
  const [history, setHistory] = useState<SoundDefinition[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const config = ANIMAL_CONFIG[animal];
  const mascotImage = config.mascot;
  const animalName = language === 'en' ? config.name_en : config.name_zh;

  const startListening = () => {
    if (isListening) return;
    
    setResults(null);
    setIsListening(true);
    
    // Simulate listening duration (2-4 seconds)
    const duration = Math.random() * 2000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setIsListening(false);
      const newResults = config.getResults();
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
    <div className="flex flex-col items-center justify-center w-full space-y-6 min-h-[60vh]">
      
      {/* Mascot Area - Clickable Round Image */}
      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            key={`mascot-${animal}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex flex-col items-center gap-4"
          >
            {/* Listening Ripple Effect */}
            {isListening && (
              <div className="absolute inset-0 z-0 w-56 h-56 md:w-72 md:h-72">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                    animate={{
                      scale: [1, 1.6],
                      opacity: [0.6, 0],
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

            {/* Round Clickable Mascot */}
            <motion.button
              onClick={isListening ? stopListening : startListening}
              whileTap={{ scale: 0.92, y: 8 }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative z-10 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden
                shadow-2xl cursor-pointer transition-all duration-200
                border-4 ${isListening ? 'border-primary shadow-primary/30' : 'border-white/50'}
                ${isListening ? 'shadow-[0_0_40px_rgba(var(--primary),0.3)]' : ''}
              `}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)'
              }}
            >
              <img 
                src={mascotImage} 
                alt={animal === 'guinea_pig' ? "Cute Guinea Pig" : "Cute Cat"} 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay when listening */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                </motion.div>
              )}
            </motion.button>

            {/* Audio Visualizer */}
            <div className="h-12 flex items-center justify-center w-full">
              {isListening && <AudioVisualizer isListening={true} />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results-spacer"
            className="h-10"
          />
        )}
      </AnimatePresence>

      {/* Text Prompt Area */}
      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            key="action"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2 w-full text-center"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {isListening 
                ? (language === 'en' ? "Listening..." : "正在聆听...")
                : (language === 'en' ? `What's your ${animalName} saying?` : `你的${animalName}在说什么？`)
              }
            </h1>
            <p className="text-muted-foreground">
              {isListening 
                ? (language === 'en' ? "Tap the image to stop" : "点击图片停止") 
                : (language === 'en' ? "Tap the image to start listening" : "点击图片开始聆听")
              }
            </p>
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
