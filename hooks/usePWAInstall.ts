import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockObj, setWakeLockObj] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Detect platform and standalone display-mode
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(ua);
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsAndroid(isAndroidDevice);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Battery API check
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Vibrate / Haptic feedback for Android
  const triggerHaptic = useCallback((pattern: number | number[] = 25) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignored if user hasn't interacted or device has no haptics
    }
  }, []);

  // Android 1-click Install Prompt
  const install = async () => {
    triggerHaptic([30, 20, 40]);
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  };

  // Toggle Android Fullscreen Immersive Mode
  const toggleFullscreen = async () => {
    triggerHaptic(20);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Keep Android Screen Awake during lessons
  const toggleWakeLock = async () => {
    triggerHaptic(25);
    try {
      if ('wakeLock' in navigator) {
        if (!wakeLockActive) {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLockObj(lock);
          setWakeLockActive(true);
          lock.addEventListener('release', () => {
            setWakeLockActive(false);
            setWakeLockObj(null);
          });
        } else if (wakeLockObj) {
          await wakeLockObj.release();
          setWakeLockActive(false);
          setWakeLockObj(null);
        }
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  };

  // Android Native Web Share
  const shareApp = async (title?: string, text?: string) => {
    triggerHaptic(20);
    const shareData = {
      title: title || 'Intute - المساعد التعليمي الذكي للأندرويد',
      text: text || 'تطبيق أندرويد حقيقي للمحادثة والتعليم الذكي التفاعلي مع الذكاء الاصطناعي.',
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        return true;
      } catch {
        // fallback
      }
    }
    return false;
  };

  return {
    deferredPrompt,
    isInstallable: !!deferredPrompt,
    isInstalled,
    isAndroid,
    isIOS,
    isFullscreen,
    wakeLockActive,
    batteryLevel,
    isOnline,
    install,
    triggerHaptic,
    toggleFullscreen,
    toggleWakeLock,
    shareApp,
  };
}
