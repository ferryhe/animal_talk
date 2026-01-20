import { useState, useRef, useEffect } from "react";
import { Mic, Globe, History, Sparkles, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TranslationResult } from "@/components/TranslationResult";
import { getRandomResult, SoundDefinition } from "@/lib/sounds";
import mascotImage from "@assets/generated_images/cute_guinea_pig_mascot_listening_with_headphones.png";

// Simple switch for language
function LanguageSwitch({ current, onChange }: { current: 'en' | 'zh', onChange: (lang: 'en' | 'zh') => void }) {
  return (
    <button 
      onClick={() => onChange(current === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 hover:bg-white border border-transparent hover:border-border transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Globe className="w-4 h-4" />
      {current === 'en' ? 'EN / 中文' : '中文 / EN'}
    </button>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'zh'>('zh'); // Default to Chinese as per prompt implication
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<SoundDefinition[] | null>(null);
  const [history, setHistory] = useState<SoundDefinition[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startListening = () => {
    if (isListening) return;
    
    setResults(null);
    setIsListening(true);
    
    // Simulate listening duration (2-4 seconds)
    const duration = Math.random() * 2000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setIsListening(false);
      const newResults = getRandomResult();
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
      // Logic for un-confirming: remove the last added item if it matches? 
      // For now, let's just not add to history if cancelled. 
      // If we want to strictly remove the *last* action, we could pop from history.
      // But user might have done other things. 
      // A simple approach: remove the most recent entry from history 
      // (assuming it was the one just added).
      setHistory(prev => prev.slice(1));
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Volume2 className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">WheekTalk</span>
        </div>
        <LanguageSwitch current={language} onChange={setLanguage} />
      </header>

      <main className="container mx-auto px-4 pt-24 pb-20 flex flex-col items-center max-w-lg min-h-screen">
        
        {/* Main Interface */}
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8">
          
          {/* Mascot Area */}
          <motion.div 
            layout
            className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {!results ? (
                <motion.div
                  key="mascot"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative z-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 h-full w-full opacity-20" />
                  <img 
                    src={mascotImage} 
                    alt="Cute Guinea Pig" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="results-spacer"
                  className="h-20" // Collapse space when results show
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
                    {language === 'en' ? "What's your piggie saying?" : "你的豚鼠在说什么？"}
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
        </div>

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
                    <p className="font-bold text-sm">{language === 'en' ? item.name : item.translations.zh.split('/')[0]}</p>
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

      </main>
    </div>
  );
}
