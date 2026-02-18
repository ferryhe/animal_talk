import { useState } from "react";
import { Volume2, ChevronDown, Check, Users, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ListenInterface } from "@/components/ListenInterface";
import { SayInterface } from "@/components/SayInterface";
import { CommunityFeed } from "@/components/CommunityFeed";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Animal = 'guinea_pig' | 'cat' | 'dog';
type Tab = 'listen' | 'say' | 'community';

const ANIMALS: { id: Animal; name: string; name_zh: string; emoji: string; appName: string }[] = [
  { id: 'guinea_pig', name: 'Guinea Pig', name_zh: '豚鼠', emoji: '🐹', appName: 'WheekTalk' },
  { id: 'cat', name: 'Cat', name_zh: '猫', emoji: '🐱', appName: 'MeowTalk' },
  { id: 'dog', name: 'Dog', name_zh: '狗', emoji: '🐕', appName: 'BarkTalk' },
];

// Simple switch for language
function LanguageSwitch({ current, onChange }: { current: 'en' | 'zh', onChange: (lang: 'en' | 'zh') => void }) {
  return (
    <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
      <button
        onClick={() => onChange('en')}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
          current === 'en' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => onChange('zh')}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
          current === 'zh' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        中
      </button>
    </div>
  );
}

// Animal switcher dropdown
function AnimalSwitcher({ 
  current, 
  onChange, 
  language 
}: { 
  current: Animal; 
  onChange: (animal: Animal) => void;
  language: 'en' | 'zh';
}) {
  const currentAnimal = ANIMALS.find(a => a.id === current)!;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-lg">
          {currentAnimal.emoji}
        </div>
        <span className="font-display font-bold text-lg tracking-tight">
          {currentAnimal.appName}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {ANIMALS.map((animal) => (
          <DropdownMenuItem
            key={animal.id}
            onClick={() => onChange(animal.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{animal.emoji}</span>
              <span>{language === 'en' ? animal.name : animal.name_zh}</span>
            </div>
            {current === animal.id && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');
  const [animal, setAnimal] = useState<Animal>('guinea_pig');
  const [activeTab, setActiveTab] = useState<Tab>('listen');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    retry: false,
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });
    window.location.reload(); // Refresh page
  };

  // Update active tab when carousel scrolls
  if (emblaApi) {
    emblaApi.on('select', () => {
      const index = emblaApi.selectedScrollSnap();
      setActiveTab(index === 0 ? 'listen' : index === 1 ? 'say' : 'community');
    });
  }

  const scrollTo = (index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <AnimalSwitcher current={animal} onChange={setAnimal} language={language} />
        <div className="flex items-center gap-4">
          <LanguageSwitch current={language} onChange={setLanguage} />
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="text-xl">{currentUser.avatar}</span>
                  <span className="hidden sm:inline text-sm font-medium">{currentUser.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
              {language === 'en' ? 'Login' : '登录'}
            </Button>
          )}
        </div>
      </header>

      {/* Tab Navigation (Visual Indicator) */}
      <div className="fixed top-20 left-0 w-full z-40 flex justify-center px-4">
        <div className="bg-muted/80 backdrop-blur-sm p-1 rounded-full border border-border/50 flex gap-1 shadow-sm">
          <button
            onClick={() => scrollTo(0)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
              activeTab === 'listen' 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {language === 'en' ? "Listen" : "听"}
          </button>
          <button
            onClick={() => scrollTo(1)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
              activeTab === 'say' 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {language === 'en' ? "Say" : "说"}
          </button>
          <button
            onClick={() => scrollTo(2)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-1.5",
              activeTab === 'community' 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            {language === 'en' ? "Community" : "社区"}
          </button>
        </div>
      </div>

      <main className="container mx-auto pt-36 pb-20 h-screen">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            <div className="flex-[0_0_100%] min-w-0 pl-4 pr-4">
              <ListenInterface language={language} animal={animal} />
            </div>
            <div className="flex-[0_0_100%] min-w-0 pl-4 pr-4 overflow-y-auto">
              <SayInterface language={language} animal={animal} />
            </div>
            <div className="flex-[0_0_100%] min-w-0 pl-4 pr-4 overflow-y-auto">
              <CommunityFeed language={language} animal={animal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
