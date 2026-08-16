import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.packersandmovers.app',
  appName: 'Packers & Movers',
  // `webDir` is required by Capacitor even when we load a remote URL.
  // We point it at a tiny committed folder with a placeholder page; it's not
  // actually shown because `server.url` below makes the app load the live
  // Vercel site whenever the device has internet.
  webDir: 'capacitor-www',
  server: {
    // Load the live web app hosted on Vercel. The Android app is a native
    // shell that opens this URL fullscreen (no browser bar).
    url: 'https://frontend-ten-dusky-35.vercel.app',
    // Allow the WebView to load the https site.
    cleartext: false,
  },
};

export default config;
