import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, Music, Play } from "lucide-react";
import { SOUND_LIBRARY, SoundDefinition } from "@/lib/sounds";
import { CAT_SOUND_LIBRARY } from "@/lib/catSounds";
import { playGuineaPigSound } from "@/lib/audio";
import { playCatSound } from "@/lib/catAudio";
import { cn } from "@/lib/utils";

interface SayInterfaceProps {
  language: 'en' | 'zh';
  animal: 'guinea_pig' | 'cat';
}

export function SayInterface({ language, animal }: SayInterfaceProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const soundLibrary = animal === 'guinea_pig' ? SOUND_LIBRARY : CAT_SOUND_LIBRARY;
  const animalName = animal === 'guinea_pig'
    ? (language === 'en' ? 'Guinea Pig' : '豚鼠')
    : (language === 'en' ? 'Cat' : '猫');

  const playSound = async (sound: SoundDefinition) => {
    if (playingId) return;

    setPlayingId(sound.id);
    
    // Play the appropriate animal sound
    if (animal === 'guinea_pig') {
      await playGuineaPigSound(sound.id);
    } else {
      await playCatSound(sound.id);
    }
    setPlayingId(null);
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6 pt-8 pb-20">
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? `Speak ${animalName}` : `说${animalName}语`}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? "Tap to play sounds and communicate" 
            : "点击播放声音与宠物交流"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md px-2">
        {soundLibrary.map((sound) => {
          const isPlaying = playingId === sound.id;
          
          return (
            <motion.button
              key={sound.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playSound(sound)}
              className={cn(
                "relative p-6 rounded-2xl border text-left transition-all duration-300 group overflow-hidden",
                isPlaying 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                  : "bg-card hover:border-primary/50 shadow-sm hover:shadow-md"
              )}
            >
              {/* Animated Background for Playing State */}
              {isPlaying && (
                <motion.div
                  layoutId="playing-bg"
                  className="absolute inset-0 bg-primary z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className={cn(
                    "font-bold text-lg mb-1", 
                    isPlaying ? "text-white" : "text-foreground"
                  )}>
                    {language === 'en' ? sound.translations.en.split('/')[0] : sound.translations.zh.split('/')[0]}
                  </h3>
                  <p className={cn(
                    "text-xs font-medium uppercase tracking-wider opacity-80",
                    isPlaying ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {language === 'en' ? sound.name : sound.name_zh}
                  </p>
                </div>
                
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  isPlaying ? "bg-white/20" : "bg-primary/10 group-hover:bg-primary/20"
                )}>
                  {isPlaying ? (
                    <Volume2 className={cn("w-5 h-5 animate-pulse", isPlaying ? "text-white" : "text-primary")} />
                  ) : (
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  )}
                </div>
              </div>
              
              {/* Context Hint */}
              <p className={cn(
                "relative z-10 text-xs mt-4 line-clamp-2",
                isPlaying ? "text-white/90" : "text-muted-foreground"
              )}>
                {language === 'en' ? sound.context.en : sound.context.zh}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
