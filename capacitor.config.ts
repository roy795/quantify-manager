
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b059a72edbe9497891d85d8c95c51676',
  appName: 'quantify-manager',
  webDir: 'dist',
  server: {
    url: 'https://b059a72e-dbe9-4978-91d8-5d8c95c51676.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined,
    }
  }
};

export default config;
