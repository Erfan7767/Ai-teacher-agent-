/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useUI } from '../lib/state';
import AndroidHubModal from './AndroidHubModal';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function FloatingControls() {
  const { setShowHelpModal, theme, setTheme } = useUI();
  const { triggerHaptic } = usePWAInstall();
  const [showAndroidHub, setShowAndroidHub] = useState(false);
  const isDarkMode = theme === 'Dark Theme';

  return (
    <>
      <div className="floating-controls">
        <button
          className="android-floating-button"
          onClick={() => {
            triggerHaptic(20);
            setShowAndroidHub(true);
          }}
          title="تطبيق أندرويد: التثبيت، ملف APK، وخصائص العتاد"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            border: 'none',
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.99 6 5.86 6 8h12c0-2.14-.97-4.01-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
          </svg>
        </button>
        <button
          className="theme-toggle-button"
          onClick={() => {
            triggerHaptic(15);
            setTheme(isDarkMode ? 'Light Theme' : 'Dark Theme');
          }}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          <span className="icon">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button
          className="help-button"
          onClick={() => {
            triggerHaptic(15);
            setShowHelpModal(true);
          }}
          title="Help"
        >
          <span className="icon">help</span>
        </button>
      </div>

      <AndroidHubModal
        isOpen={showAndroidHub}
        onClose={() => setShowAndroidHub(false)}
      />
    </>
  );
}

