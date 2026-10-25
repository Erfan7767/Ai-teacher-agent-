/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Modal from './Modal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAgent, useUI } from '../lib/state';

interface AndroidHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AndroidHubModal({ isOpen, onClose }: AndroidHubModalProps) {
  const {
    isInstallable,
    isInstalled,
    isAndroid,
    isFullscreen,
    wakeLockActive,
    batteryLevel,
    isOnline,
    install,
    triggerHaptic,
    toggleFullscreen,
    toggleWakeLock,
    shareApp,
  } = usePWAInstall();

  const { setCurrent, availablePresets } = useAgent();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'hardware'>('install');
  const [copySuccess, setCopySuccess] = useState(false);
  const [vibrateTestCount, setVibrateTestCount] = useState(0);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleInstallClick = async () => {
    triggerHaptic([30, 40, 50]);
    const success = await install();
    if (success) {
      triggerHaptic([50, 100, 50]);
    }
  };

  const handleTestVibrate = () => {
    triggerHaptic([40, 60, 80]);
    setVibrateTestCount(prev => prev + 1);
  };

  const handleCopyLink = async () => {
    triggerHaptic(25);
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  const switchToArabicTutor = () => {
    triggerHaptic([30, 40]);
    const karimAgent = availablePresets.find(a => a.id === 'karim');
    if (karimAgent) {
      setCurrent(karimAgent);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="android-hub-modal text-right" dir="rtl" style={{ maxWidth: '640px', width: '100%', fontFamily: 'Cairo, Google Sans, sans-serif' }}>
        
        {/* Header with Android Robot Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-green-500/20">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.99 6 5.86 6 8h12c0-2.14-.97-4.01-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                مركز تطبيق أندرويد الكامل
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  Android 100%
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                تطبيق أندرويد حقيقي متكامل قابل للتثبيت كـ PWA أو تحويله إلى ملف APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="إغلاق"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Status Indicators Pills */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className={`p-2 rounded-xl border ${isInstalled ? 'bg-green-950/40 border-green-700/60 text-green-300' : 'bg-blue-950/40 border-blue-700/60 text-blue-300'}`}>
            <div className="text-[10px] uppercase font-semibold text-gray-400">وضع التشغيل</div>
            <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></span>
              {isInstalled ? 'تطبيق مثبت (مستقل)' : 'جاهز للتثبيت'}
            </div>
          </div>

          <div className="p-2 rounded-xl border bg-gray-900/60 border-gray-800 text-gray-200">
            <div className="text-[10px] uppercase font-semibold text-gray-400">حالة الاتصال</div>
            <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isOnline ? 'متصل بالإنترنت' : 'يعمل بدون إنترنت (كاش)'}
            </div>
          </div>

          <div className="p-2 rounded-xl border bg-gray-900/60 border-gray-800 text-gray-200">
            <div className="text-[10px] uppercase font-semibold text-gray-400">عتاد أندرويد</div>
            <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
              <span>{batteryLevel !== null ? `🔋 ${batteryLevel}%` : '📱 هاتف أندرويد'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'install'
                ? 'border-green-400 text-green-400 bg-green-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">download_for_offline</span>
            التثبيت المباشر على أندرويد
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'apk'
                ? 'border-green-400 text-green-400 bg-green-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">android</span>
            تنزيل APK & Google Play
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'hardware'
                ? 'border-green-400 text-green-400 bg-green-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">settings_suggest</span>
            وظائف عتاد الأندرويد
          </button>
        </div>

        {/* Tab 1: Instant Direct Install */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-950/40 via-green-950/20 to-teal-950/40 p-4 rounded-2xl border border-green-800/40">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-400 text-3xl">verified</span>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">تثبيت فوري بضغطة زر كـ تطبيق هاتف</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    يعمل التطبيق كـ Progressive Web App كامل التوافق مع متطلبات نظام Google Android: أيقونة على شاشة الهاتف، نافذة مستقلة بدون شريط متصفح، دعم العمل دون إنترنت، ووصول سريع.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 active:scale-95 transition"
                  >
                    <span className="material-symbols-outlined text-lg">install_mobile</span>
                    تثبيت التطبيق على جهاز أندرويد الآن
                  </button>
                ) : isInstalled ? (
                  <div className="flex-1 py-3 px-4 rounded-xl bg-green-900/50 border border-green-500/40 text-green-300 font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    التطبيق مثبت بالفعل على جهازك في الشاشة الرئيسية!
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <span className="material-symbols-outlined text-lg">add_to_home_screen</span>
                    إضافة إلى الشاشة الرئيسية (أندرويد)
                  </button>
                )}
                
                <button
                  onClick={() => shareApp()}
                  className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-gray-700 transition"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  مشاركة التطبيق
                </button>
              </div>
            </div>

            {/* Quick manual install instructions for Android Chrome / Samsung */}
            <div className="bg-gray-900/70 p-4 rounded-2xl border border-gray-800">
              <h4 className="text-xs font-bold text-gray-200 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-400 text-base">help</span>
                كيف تثبته يدويًا على أي هاتف أندرويد؟
              </h4>
              <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside pr-1">
                <li>افتح هذا الرابط على متصفح Chrome أو Samsung Internet في هاتفك.</li>
                <li>اضغط على زر القائمة <strong className="text-white">(ثلاث نقاط ⋮)</strong> أعلى يسار أو يمين الشاشة.</li>
                <li>اختر <strong className="text-green-400">"تثبيت التطبيق"</strong> أو <strong className="text-green-400">"إضافة إلى الشاشة الرئيسية"</strong>.</li>
                <li>ستظهر أيقونة التطبيق الخضراء في قائمة تطبيقات أندرويد وستفتح مثل أي تطبيق أصلي!</li>
              </ol>
            </div>

            {/* Quick Arabic Tutor Promotion */}
            <div className="bg-blue-950/30 p-3.5 rounded-2xl border border-blue-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">ع</span>
                <div>
                  <div className="text-xs font-bold text-white">الأستاذ كريم (المعلم العربي الذكي)</div>
                  <div className="text-[11px] text-gray-400">دروس ومحادثة صوتية فورية باللغة العربية الفصحى</div>
                </div>
              </div>
              <button
                onClick={switchToArabicTutor}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                تفعيل المعلم
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: APK & Google Play */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 p-4 rounded-2xl border border-indigo-700/40">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">package_2</span>
                تحويل التطبيق إلى ملف APK جاهز للتثبيت أو متجر Google Play
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                بما أن هذا التطبيق تم بناؤه بمواصفات Progressive Web App المعتمدة، يمكنك بنقرة واحدة توليد ملف <strong>APK</strong> أو حزمة <strong>AAB (Android App Bundle)</strong> موقعة رقمياً ومجهزة للرفع على متجر Google Play.
              </p>

              <div className="mt-4 p-3 bg-black/40 rounded-xl border border-gray-800 flex items-center justify-between gap-2">
                <div className="truncate text-xs text-gray-400 font-mono" dir="ltr">
                  {currentUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium shrink-0 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">{copySuccess ? 'check' : 'content_copy'}</span>
                  {copySuccess ? 'تم النسخ' : 'نسخ الرابط'}
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  فتح منشئ APK الفوري (PWABuilder)
                </a>
              </div>
            </div>

            <div className="bg-gray-900/70 p-4 rounded-2xl border border-gray-800 text-xs text-gray-300 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-sm">lightbulb</span>
                طرق حزم التطبيق كـ APK فعلي:
              </h4>
              <div className="space-y-2 pt-1 text-[11px] leading-relaxed">
                <div>
                  <strong className="text-green-400">1. أداة PWABuilder (الأسهل - بنقرة واحدة):</strong>
                  <p className="text-gray-400">تقوم بفحص هذا التطبيق وتوليد ملف APK جاهز للتثبيت على أي هاتف أندرويد فوراً مع شهادة توقيع رقمية.</p>
                </div>
                <div>
                  <strong className="text-blue-400">2. أداة Bubblewrap (من فريق Google Chrome الرسمي):</strong>
                  <p className="text-gray-400">حزمة رسمية من Google تعتمد على تقنية Trusted Web Activity (TWA) لبناء تطبيق أندرويد حقيقي 100% يدمج كل قدرات الهاتف.</p>
                </div>
                <div>
                  <strong className="text-purple-400">3. إطار عمل Capacitor / Cordova:</strong>
                  <p className="text-gray-400">إذا أردت دمج إضافات أندرويد متقدمة ومستشعرات أجهزة إضافية داخل مشروع أندرويد ستوديو.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Android Hardware Controls */}
        {activeTab === 'hardware' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fullscreen Immersive */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-400 text-base">fullscreen</span>
                    ملء الشاشة الكامل
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">إخفاء أشرطة المتصفح لتجربة أندرويد نقية</div>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isFullscreen ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  {isFullscreen ? 'مفعل' : 'تفعيل'}
                </button>
              </div>

              {/* Wake Lock */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-base">wb_sunny</span>
                    إبقاء الشاشة مضاءة
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">منع قفل شاشة الهاتف أثناء الدرس</div>
                </div>
                <button
                  onClick={toggleWakeLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    wakeLockActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  {wakeLockActive ? 'مضاءة دائمًا' : 'تفعيل'}
                </button>
              </div>

              {/* Haptic Feedback Test */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-purple-400 text-base">vibration</span>
                    الاهتزاز والتفاعل اللمسي
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">اهتزاز عند النقر والتحدث والردود</div>
                </div>
                <button
                  onClick={handleTestVibrate}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-bold transition"
                >
                  تجربة الاهتزاز {vibrateTestCount > 0 ? `(${vibrateTestCount})` : ''}
                </button>
              </div>

              {/* Native Android Share */}
              <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-green-400 text-base">share</span>
                    مشاركة نظام أندرويد
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">إرسال الدرس للواتساب وتيليجرام</div>
                </div>
                <button
                  onClick={() => shareApp()}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition"
                >
                  مشاركة
                </button>
              </div>
            </div>

            {/* Offline Cache Info */}
            <div className="p-3 bg-gray-900/50 rounded-2xl border border-gray-800 text-xs text-gray-300 flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-400 text-2xl">offline_pin</span>
              <div>
                <span className="font-bold text-white">دعم كامل للعمل بدون إنترنت (Offline Service Worker):</span>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  تم تخزين واجهة التطبيق، الخطوط، الأيقونات، ومكونات الرياضيات مسبقاً في ذاكرة التخزين المؤقت للأندرويد لتعمل فوراً دون تأخير.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>Intute Android Edition v1.2</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </Modal>
  );
}
