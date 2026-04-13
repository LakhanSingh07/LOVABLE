import { NativeModules, Platform } from 'react-native';

import { CanvasPayload } from '../types/canvas';

type NativeWallpaperModule = {
  openWallpaperPicker(): Promise<boolean>;
  updateWallpaperCache(payload: string): Promise<boolean>;
};

const nativeModule: NativeWallpaperModule | undefined =
  Platform.OS === 'android'
    ? (NativeModules.WallpaperModule as NativeWallpaperModule | undefined)
    : undefined;

export const wallpaperBridge = {
  available: Boolean(nativeModule),

  async openPicker() {
    if (!nativeModule) {
      return false;
    }

    return nativeModule.openWallpaperPicker();
  },

  async updateCache(payload: CanvasPayload) {
    if (!nativeModule) {
      return false;
    }

    return nativeModule.updateWallpaperCache(JSON.stringify(payload));
  },
};
