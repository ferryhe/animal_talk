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

export const DOG_SOUND_LIBRARY: SoundDefinition[] = [
  {
    id: 'bark',
    name: 'Bark',
    name_zh: '汪汪叫',
    description: 'Classic dog vocalization',
    translations: {
      en: "Alert! / Hey, look!",
      zh: "警报！/ 嘿，看！"
    },
    context: {
      en: "Alerting to something, greeting, or seeking attention.",
      zh: "警觉某事、打招呼或寻求注意。"
    }
  },
  {
    id: 'whine_dog',
    name: 'Whine',
    name_zh: '呜呜声',
    description: 'High-pitched whimpering',
    translations: {
      en: "I want something / Please!",
      zh: "我想要某样东西 / 拜托！"
    },
    context: {
      en: "Expressing desire, anxiety, or seeking comfort.",
      zh: "表达渴望、焦虑或寻求安慰。"
    }
  },
  {
    id: 'growl',
    name: 'Growl',
    name_zh: '低吼',
    description: 'Low rumbling warning',
    translations: {
      en: "Back off! / Warning!",
      zh: "退后！/ 警告！"
    },
    context: {
      en: "Warning sign - feeling threatened or protective.",
      zh: "警告信号 - 感到受威胁或保护性行为。"
    }
  },
  {
    id: 'howl',
    name: 'Howl',
    name_zh: '嚎叫',
    description: 'Long, loud cry',
    translations: {
      en: "I'm here! / Where are you?",
      zh: "我在这里！/ 你在哪里？"
    },
    context: {
      en: "Communication over distance, response to sirens, or loneliness.",
      zh: "远距离交流、对警报声的反应或孤独感。"
    }
  },
  {
    id: 'yip',
    name: 'Yip / Yelp',
    name_zh: '尖叫',
    description: 'Short, high-pitched cry',
    translations: {
      en: "Ouch! / Startled!",
      zh: "哎呀！/ 吓一跳！"
    },
    context: {
      en: "Pain, surprise, or excitement during play.",
      zh: "疼痛、惊讶或玩耍时的兴奋。"
    }
  },
  {
    id: 'pant',
    name: 'Happy Panting',
    name_zh: '开心喘气',
    description: 'Relaxed open-mouth breathing',
    translations: {
      en: "I'm happy! / Let's play!",
      zh: "我很开心！/ 一起玩吧！"
    },
    context: {
      en: "Contentment, excitement, or cooling down after activity.",
      zh: "满足、兴奋或活动后降温。"
    }
  }
];

export const getRandomDogResult = (): SoundDefinition[] => {
  const shuffled = [...DOG_SOUND_LIBRARY].sort(() => 0.5 - Math.random());
  
  const topMatch = { ...shuffled[0], confidence: Math.floor(Math.random() * 15) + 80 };
  const secondMatch = { ...shuffled[1], confidence: Math.floor(Math.random() * 20) + 40 };
  const thirdMatch = { ...shuffled[2], confidence: Math.floor(Math.random() * 20) + 10 };
  
  return [topMatch, secondMatch, thirdMatch];
};
