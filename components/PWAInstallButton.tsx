/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import AndroidHubModal from './AndroidHubModal';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'floating' | 'full' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, install, triggerHaptic } = usePWAInstall();
  const [showAndroidHub, setShowAndroidHub] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(25);
    setShowAndroidHub(true);
  };

  const handleDirectInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([30, 40]);
    if (isInstallable) {
      await install();
    } else {
      setShowAndroidHub(true);
    }
  };

  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2">
          <button
            onClick={handleClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-xl shadow-green-500/25 border border-green-300/40 transition active:scale-95"
            title="إعدادات وتثبيت تطبيق أندرويد"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.99 6 5.86 6 8h12c0-2.14-.97-4.01-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
            <span>{isInstalled ? 'تطبيق أندرويد' : 'تثبيت أندرويد'}</span>
          </button>
        </div>

        <AndroidHubModal
          isOpen={showAndroidHub}
          onClose={() => setShowAndroidHub(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="android-header-badge flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold transition active:scale-95"
        title="تطبيق أندرويد: خيارات التثبيت وملف APK والعتاد"
      >
        <svg className="w-4 h-4 shrink-0 text-green-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.99 6 5.86 6 8h12c0-2.14-.97-4.01-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
        </svg>
        <span className="hidden sm:inline">{isInstalled ? 'أندرويد (مثبت)' : 'تثبيت كـ أندرويد'}</span>
        <span className="sm:hidden">أندرويد</span>
        {isInstallable && (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
        )}
      </button>

      <AndroidHubModal
        isOpen={showAndroidHub}
        onClose={() => setShowAndroidHub(false)}
      />
    </>
  );
};
