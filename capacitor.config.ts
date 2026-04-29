import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rhucare.app',
  appName: 'RHU-CARE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
