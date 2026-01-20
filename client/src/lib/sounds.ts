export interface SoundDefinition {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  translations: {
    en: string;
    zh: string;
  };
  context: {
    en: string;
    zh: string;
  };
  confidence?: number;
}

export const SOUND_LIBRARY: SoundDefinition[] = [
  {
    id: 'wheek',
    name: 'Wheek',
    name_zh: '尖叫 (求食声)',
    description: 'A loud, long whistle',
    translations: {
      en: "Feed me! / I'm excited!",
      zh: "喂我！/ 我好兴奋！"
    },
    context: {
      en: "Often heard when opening the fridge or hearing a bag rustle.",
      zh: "通常在打开冰箱或听到袋子响声时听到。"
    }
  },
  {
    id: 'purr',
    name: 'Purr',
    name_zh: '咕噜声',
    description: 'Deep, vibrating sound',
    translations: {
      en: "I'm happy / Content",
      zh: "我很开心 / 满足"
    },
    context: {
      en: "Heard when being petted or relaxed.",
      zh: "被抚摸或放松时发出。"
    }
  },
  {
    id: 'rumble',
    name: 'Rumble',
    name_zh: '隆隆声 (宣示主权)',
    description: 'Low, vibrating purr with hip swaying',
    translations: {
      en: "I'm the boss (Dominance)",
      zh: "我是老大（宣示主权）"
    },
    context: {
      en: "Used to establish hierarchy or court a mate.",
      zh: "用于建立等级制度或求偶。"
    }
  },
  {
    id: 'chut',
    name: 'Chutting',
    name_zh: '嗒嗒声 (探索)',
    description: 'Short, quiet staccato sounds',
    translations: {
      en: "Curious / Exploring",
      zh: "好奇 / 探索中"
    },
    context: {
      en: "Heard while wandering around and sniffing things.",
      zh: "在四处游荡和嗅闻时听到。"
    }
  },
  {
    id: 'chatter',
    name: 'Teeth Chattering',
    name_zh: '磨牙声 (警告)',
    description: 'Rapid clicking of teeth',
    translations: {
      en: "Back off! (Warning)",
      zh: "走开！（警告）"
    },
    context: {
      en: "Sign of aggression or fear. Give them space.",
      zh: "攻击或恐惧的迹象。给它们一点空间。"
    }
  },
  {
    id: 'whine',
    name: 'Whine',
    name_zh: '呜咽声',
    description: 'High-pitched moan',
    translations: {
      en: "I'm annoyed / Dislike this",
      zh: "我很烦 / 不喜欢这个"
    },
    context: {
      en: "Often heard when being disturbed or waking up.",
      zh: "通常在被打扰或刚醒来时听到。"
    }
  }
];

export const getRandomResult = (): SoundDefinition[] => {
  // Simulate AI prediction by picking a random sound as top match
  // and 1-2 others as lower confidence matches
  const shuffled = [...SOUND_LIBRARY].sort(() => 0.5 - Math.random());
  
  const topMatch = { ...shuffled[0], confidence: Math.floor(Math.random() * 15) + 80 }; // 80-95%
  const secondMatch = { ...shuffled[1], confidence: Math.floor(Math.random() * 20) + 40 }; // 40-60%
  const thirdMatch = { ...shuffled[2], confidence: Math.floor(Math.random() * 20) + 10 }; // 10-30%
  
  return [topMatch, secondMatch, thirdMatch];
};
