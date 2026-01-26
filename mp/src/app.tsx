import React from 'react';
import { View, Text } from '@tarojs/components';
import './app.css';

export default function App({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const config = {
  pages: [
    'pages/listen/index',
    'pages/say/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'Animal Talk',
    navigationBarTextStyle: 'black'
  }
};
