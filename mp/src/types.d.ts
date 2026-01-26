import { IncomingMessage } from 'http';

declare module '@tarojs/taro' {
  interface TaroStatic {
    getRecorderManager(): RecorderManager;
    createInnerAudioContext(): InnerAudioContext;
    request<T = any>(options: RequestOptions): Promise<Response<T>>;
    showToast(options: { title: string; icon?: string }): void;
    navigateTo(options: { url: string }): void;
  }

  interface RecorderManager {
    start(options: { format?: string }): void;
    stop(): void;
    onStop(callback: (res: any) => void): void;
    onError(callback: (error: any) => void): void;
  }

  interface InnerAudioContext {
    src: string;
    autoplay: boolean;
    play(): void;
    stop(): void;
    onError(callback: (error: any) => void): void;
    destroy(): void;
  }

  interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
    data?: any;
    header?: Record<string, string>;
  }

  interface Response<T = any> {
    data: T;
    statusCode: number;
    header: Record<string, string>;
  }
}
