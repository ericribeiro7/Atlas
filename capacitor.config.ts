import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atlas.app',
  appName: 'Atlas',
  webDir: 'dist',
  android: {
    backgroundColor: '#09090b',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#09090b',
      showSpinner: false,
    },
  },
};

export default config;
