import Taro from '@tarojs/taro';

const BASE = process.env.BACKEND_URL || 'http://localhost:5000';

export const fetchSounds = async (animal: string) => {
  const res = await Taro.request({
    url: `${BASE}/api/sounds`,
    method: 'GET',
    data: { animal }
  });
  return res.data;
};

export const postAnalysis = async (formData: any) => {
  const res = await Taro.request({
    url: `${BASE}/api/analyze`,
    method: 'POST',
    data: formData,
    header: { 'content-type': 'application/json' }
  });
  return res.data;
};
