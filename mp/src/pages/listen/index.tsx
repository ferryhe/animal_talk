import React, { useState } from 'react';
import { View, Button, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getSoundLibrary } from '@/lib/soundLibrary';

type RecognizerAnimal = 'cat' | 'dog' | 'guinea_pig';

interface RecognitionResult {
  animal: RecognizerAnimal;
  sound: string;
  confidence: number;
  meaning_zh: string;
  context_zh: string;
}

export default function ListenPage() {
  const [recording, setRecording] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<RecognizerAnimal>('cat');
  const [loading, setLoading] = useState(false);

  const recorder = Taro.getRecorderManager();

  recorder.onStop((res: any) => {
    if (res.tempFilePath) {
      setFilePath(res.tempFilePath);
    }
    setRecording(false);
  });

  recorder.onError(() => {
    setRecording(false);
    Taro.showToast({ title: '录音失败', icon: 'none' });
  });

  const start = async () => {
    try {
      // 请求录音权限
      const authRes = await Taro.authorize({ scope: 'scope.record' }).catch(() => ({ errMsg: 'denied' }));
      
      if (authRes.errMsg && authRes.errMsg.includes('denied')) {
        Taro.showToast({ title: '需要录音权限', icon: 'none' });
        return;
      }

      recorder.start({ format: 'mp3' });
      setRecording(true);
    } catch (err) {
      Taro.showToast({ title: '启动录音失败', icon: 'none' });
    }
  };

  const stop = () => {
    recorder.stop();
  };

  const analyze = async () => {
    if (!filePath) {
      Taro.showToast({ title: '请先录音', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const response = await Taro.request({
        url: `${baseUrl}/api/analyze`,
        method: 'POST',
        data: {
          animal: selectedAnimal,
          audioPath: filePath
        },
        header: { 'content-type': 'application/json' }
      });

      if (response.statusCode === 200) {
        const data = response.data as any;
        const sounds = getSoundLibrary(selectedAnimal);
        const matchedSound = sounds.find(s => s.id.includes(data.sound));

        setResult({
          animal: selectedAnimal,
          sound: data.sound,
          confidence: data.confidence || 0.85,
          meaning_zh: matchedSound?.translations.zh || '识别中...',
          context_zh: matchedSound?.context.zh || ''
        });
      } else {
        Taro.showToast({ title: '分析失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络错误', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView scrollY style={{ height: '100vh', padding: '16px' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>👂 动物识别</Text>

      {/* 选择动物 */}
      <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>选择动物类型：</Text>
        {(['cat', 'dog', 'guinea_pig'] as const).map((animal) => (
          <Button
            key={animal}
            size="small"
            onClick={() => setSelectedAnimal(animal)}
            style={{
              marginRight: 8,
              marginBottom: 8,
              backgroundColor: selectedAnimal === animal ? '#007AFF' : '#ddd',
              color: selectedAnimal === animal ? 'white' : 'black'
            }}
          >
            {animal === 'cat' ? '🐱 猫' : animal === 'dog' ? '🐕 狗' : '🐹 豚鼠'}
          </Button>
        ))}
      </View>

      {/* 录音控制 */}
      <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#FFF3E0', borderRadius: 8 }}>
        <Text style={{ fontSize: 14, marginBottom: 12, color: recording ? '#FF6F00' : '#000' }}>
          {recording ? '⏺️ 正在录音...' : '点击下方按钮开始录音'}
        </Text>
        <View style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={recording ? stop : start}
            style={{
              flex: 1,
              backgroundColor: recording ? '#FF6F00' : '#4CAF50',
              color: 'white'
            }}
          >
            {recording ? '⏹️ 停止录音' : '🎤 开始录音'}
          </Button>
          {filePath && (
            <Button
              onClick={analyze}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#ccc' : '#007AFF',
                color: 'white'
              }}
            >
              {loading ? '分析中...' : '🔍 分析'}
            </Button>
          )}
        </View>
      </View>

      {/* 识别结果 */}
      {result && (
        <View style={{ padding: 12, backgroundColor: '#E8F5E9', borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>✅ 识别结果</Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#333' }}>
              🎵 {result.sound.toUpperCase()} ({(result.confidence * 100).toFixed(0)}% 匹配度)
            </Text>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>意思：</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>{result.meaning_zh}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>场景：</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>{result.context_zh}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
