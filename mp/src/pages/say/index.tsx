import React, { useState } from 'react';
import { View, Button, Text, Picker, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getSoundLibrary, type SoundDefinition } from '@/lib/soundLibrary';

const ANIMALS = ['cat', 'dog', 'guinea_pig'] as const;
const ANIMAL_NAMES = { cat: '猫', dog: '狗', guinea_pig: '豚鼠' };

export default function SayPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<'cat' | 'dog' | 'guinea_pig'>('cat');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<ReturnType<typeof Taro.createInnerAudioContext> | null>(null);

  const sounds = getSoundLibrary(selectedAnimal);

  const playSample = (sound: SoundDefinition) => {
    // 停止之前的播放
    if (currentAudio) {
      currentAudio.stop();
      currentAudio.destroy();
    }

    const audio = Taro.createInnerAudioContext();
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    audio.src = baseUrl + sound.url;
    audio.autoplay = true;

    setPlayingId(sound.id);
    setCurrentAudio(audio);

    audio.onEnded(() => {
      setPlayingId(null);
      audio.destroy();
    });

    audio.onError(() => {
      setPlayingId(null);
      Taro.showToast({ title: '播放失败', icon: 'none' });
    });
  };

  const handleAnimalChange = (e: any) => {
    const value = ANIMALS[parseInt(e.detail.value)];
    setSelectedAnimal(value);
  };

  return (
    <ScrollView scrollY style={{ height: '100vh', padding: '16px' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>🗣️ 动物叫声</Text>

      {/* 选择动物 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>选择动物：</Text>
        <Picker mode="selector" range={Object.values(ANIMAL_NAMES)} onChange={handleAnimalChange}>
          <View style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <Text>{ANIMAL_NAMES[selectedAnimal]}</Text>
          </View>
        </Picker>
      </View>

      {/* 声音列表 */}
      <View>
        <Text style={{ fontSize: 14, marginBottom: 12, color: '#666' }}>点击播放声音：</Text>
        {sounds.map((sound) => (
          <View
            key={sound.id}
            style={{
              marginBottom: 12,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              borderLeft: playingId === sound.id ? '4px solid #007AFF' : '4px solid #ddd'
            }}
          >
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{sound.name_zh} ({sound.name})</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>意思：{sound.translations.zh}</Text>
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#999' }}>场景：{sound.context.zh}</Text>
            </View>
            <Button
              size="small"
              onClick={() => playSample(sound)}
              style={{
                backgroundColor: playingId === sound.id ? '#FF9500' : '#007AFF',
                color: 'white',
                border: 'none'
              }}
            >
              {playingId === sound.id ? '▶️ 播放中...' : '▶️ 播放'}
            </Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
