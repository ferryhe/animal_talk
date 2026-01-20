import { SoundDefinition } from "@/lib/guineaPigSounds";
import { Check, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TranslationResultProps {
  results: SoundDefinition[];
  language: 'en' | 'zh';
  onConfirm: (sound: SoundDefinition | null) => void;
}

export function TranslationResult({ results, language, onConfirm }: TranslationResultProps) {
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleConfirm = (sound: SoundDefinition) => {
    if (confirmedId === sound.id) {
      setConfirmedId(null);
      onConfirm(null);
    } else {
      setConfirmedId(sound.id);
      onConfirm(sound);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {results.map((sound, index) => {
        const isTop = index === 0;
        const isConfirmed = confirmedId === sound.id;
        
        return (
          <motion.div
            key={sound.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
              isTop ? "bg-card shadow-lg border-primary/20" : "bg-card/50 border-transparent shadow-sm",
              isConfirmed ? "ring-2 ring-green-500 bg-green-50/50" : ""
            )}
          >
            {isTop && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary/20" />
            )}

            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={cn("font-bold", isTop ? "text-xl text-primary" : "text-lg text-foreground/80")}>
                  {language === 'en' ? sound.name : sound.name_zh} 
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'en' ? sound.context.en : sound.context.zh}
                </p>
              </div>
              <div className="text-right">
                <span className={cn("font-mono font-bold", isTop ? "text-primary" : "text-muted-foreground")}>
                  {sound.confidence}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative pt-1">
                <Progress value={sound.confidence} className={cn("h-2", isTop ? "bg-primary/10" : "bg-muted")} />
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg text-center font-medium text-foreground">
                "{language === 'en' ? sound.translations.en : sound.translations.zh}"
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                variant={isConfirmed ? "default" : "outline"} 
                size="sm"
                className={cn(
                  "gap-2 transition-all",
                  isConfirmed ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : "hover:text-primary hover:border-primary/50"
                )}
                onClick={() => handleConfirm(sound)}
              >
                {isConfirmed ? (
                  <>
                    <Check className="w-4 h-4" />
                    {language === 'en' ? "Confirmed" : "已确认"}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    {language === 'en' ? "Confirm Match" : "确认匹配"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
