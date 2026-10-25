/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-xl border border-amber-400/30 animate-pulse"
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      وضع عدم الاتصال: يتم استخدام البيانات والملفات المخزنة في ذاكرة الهاتف.
    </div>
  );
};
