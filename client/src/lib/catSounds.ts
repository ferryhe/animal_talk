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

export const CAT_SOUND_LIBRARY: SoundDefinition[] = [
  {
    id: 'meow',
    name: 'Meow',
    name_zh: '喵喵叫',
    description: 'Classic cat vocalization',
    translations: {
      en: "Hey! / Pay attention to me!",
      zh: "嘿！/ 注意我！"
    },
    context: {
      en: "General communication, often directed at humans.",
      zh: "一般交流，通常是对人发出的。"
    }
  },
  {
    id: 'purr_cat',
    name: 'Purr',
    name_zh: '咕噜咕噜',
    description: 'Continuous vibrating sound',
    translations: {
      en: "I'm content / Relaxed",
      zh: "我很满足 / 放松"
    },
    context: {
      en: "When being petted, comfortable, or sometimes self-soothing.",
      zh: "被抚摸时、舒适时，有时用来自我安慰。"
    }
  },
  {
    id: 'hiss',
    name: 'Hiss',
    name_zh: '嘶嘶声 (警告)',
    description: 'Sharp hissing sound',
    translations: {
      en: "Back off! / I'm scared!",
      zh: "走开！/ 我害怕！"
    },
    context: {
      en: "Warning sign of fear or aggression. Give them space.",
      zh: "恐惧或攻击的警告信号。给它们空间。"
    }
  },
  {
    id: 'chirp',
    name: 'Chirp / Trill',
    name_zh: '啾啾声',
    description: 'Short, bird-like sound',
    translations: {
      en: "Hello! / Come here!",
      zh: "你好！/ 过来！"
    },
    context: {
      en: "Friendly greeting, often used by mother cats with kittens.",
      zh: "友好的问候，母猫常对小猫使用。"
    }
  },
  {
    id: 'yowl',
    name: 'Yowl',
    name_zh: '嚎叫',
    description: 'Long, loud cry',
    translations: {
      en: "I'm in distress / Where are you?",
      zh: "我很痛苦 / 你在哪里？"
    },
    context: {
      en: "Can indicate pain, confusion, or mating behavior.",
      zh: "可能表示疼痛、困惑或求偶行为。"
    }
  },
  {
    id: 'chatter_cat',
    name: 'Chattering',
    name_zh: '咔嗒声 (狩猎)',
    description: 'Rapid teeth chattering',
    translations: {
      en: "I see prey! / So exciting!",
      zh: "我看到猎物了！/ 太兴奋了！"
    },
    context: {
      en: "Often seen when watching birds through a window.",
      zh: "通常在透过窗户看鸟时出现。"
    }
  }
];

export const getRandomCatResult = (): SoundDefinition[] => {
  const shuffled = [...CAT_SOUND_LIBRARY].sort(() => 0.5 - Math.random());
  
  const topMatch = { ...shuffled[0], confidence: Math.floor(Math.random() * 15) + 80 };
  const secondMatch = { ...shuffled[1], confidence: Math.floor(Math.random() * 20) + 40 };
  const thirdMatch = { ...shuffled[2], confidence: Math.floor(Math.random() * 20) + 10 };
  
  return [topMatch, secondMatch, thirdMatch];
};
