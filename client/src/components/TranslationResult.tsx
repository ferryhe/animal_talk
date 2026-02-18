import { SoundDefinition } from "@/lib/guineaPigSounds";
import { Check, ThumbsUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generateAudioData } from "@/lib/audioGenerator";

interface TranslationResultProps {
  results: SoundDefinition[];
  language: 'en' | 'zh';
  animal: 'guinea_pig' | 'cat' | 'dog';
  onConfirm: (sound: SoundDefinition | null) => void;
  onShare?: (sound: SoundDefinition) => void;
  recordedAudio?: string | null; // Base64 encoded audio from microphone
}

export function TranslationResult({ results, language, animal, onConfirm, onShare, recordedAudio }: TranslationResultProps) {
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async (sound: SoundDefinition) => {
      // Use recorded audio if available, otherwise generate synthetic audio
      let audioData = recordedAudio;
      
      if (!audioData) {
        audioData = generateAudioData(
          sound.id, // Use sound ID for synthetic audio fallback
          1000 // 1 second audio
        );
      }
      
      const postData: any = {
        animal,
        soundType: language === 'en' ? sound.name : sound.name_zh,
        interpretation: language === 'en' ? sound.translations.en : sound.translations.zh,
        confidence: sound.confidence,
        duration: recordedAudio ? 3000 : 1000, // Recorded audio is longer
        metadata: {
          context: sound.context,
          allTranslations: sound.translations,
          soundId: sound.id,
          isRecordedAudio: !!recordedAudio,
        },
      };
      
      // Include audio data only if available
      if (audioData) {
        postData.audioData = audioData;
      }
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to share: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: language === 'en' ? "Shared to Community!" : "已分享到社区！",
        description: language === 'en' ? "Your sound interpretation has been posted." : "您的声音解释已发布。",
      });
      setSharingId(null);
    },
    onError: () => {
      toast({
        title: language === 'en' ? "Failed to Share" : "分享失败",
        variant: "destructive",
      });
      setSharingId(null);
    },
  });

  const handleConfirm = (sound: SoundDefinition) => {
    if (confirmedId === sound.id) {
      setConfirmedId(null);
      onConfirm(null);
    } else {
      setConfirmedId(sound.id);
      onConfirm(sound);
    }
  };

  const handleShare = (sound: SoundDefinition) => {
    setSharingId(sound.id);
    shareMutation.mutate(sound);
    if (onShare) {
      onShare(sound);
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

            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 hover:text-primary hover:border-primary/50"
                onClick={() => handleShare(sound)}
                disabled={sharingId === sound.id}
              >
                <Share2 className="w-4 h-4" />
                {language === 'en' ? "Share" : "分享"}
              </Button>
              
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
                    {language === 'en' ? "Confirm" : "确认"}
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
