/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState } from 'react';
import { useUI } from '../lib/state';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const transliterations = [
  'Intute',
  'インテュート', // Japanese
  '인튜트', // Korean
  '英图特', // Chinese
  'Интуте', // Russian
  'إنتوت', // Arabic
  'אינטוט', // Hebrew
  'इंट्यूट', // Hindi
  'อินทูต', // Thai
  'Ιντούτε', // Greek
  'İntute', // Turkish
  'Интуи', // Ukrainian (variant)
  'ინტუტე', // Georgian
  'இன்ட்யூட்', // Tamil
  'ಇಂಟ್ಯೂಟ್', // Kannada
  'ഇൻട്യൂട്ട്', // Malayalam
  'انٹیوٹ', // Urdu
  'Інтют', // Ukrainian
  'Intūte', // Latvian
  'Интюте', // Bulgarian
];


/**
 * The initial welcome screen for the application. It provides a brief
 * overview of the app's features and a prominent button to start the
 * configuration process.
 */
export default function WelcomeScreen() {
  const { setShowWelcomeScreen } = useUI();
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasKey, setHasKey] = useState(true); // Default to true to avoid flicker

  // Trigger the entrance animation shortly after the component mounts.
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Check if API key is selected
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = true;
        setHasKey(selected);
      }
    };
    checkKey();

    return () => clearTimeout(timer);
  }, []);

  /**
   * Handles the action to close the welcome screen. It triggers an exit
   * animation and then proceeds directly to the main application.
   */
  async function handleClose() {
    if (!hasKey && window.aistudio) {
      await window.aistudio.openSelectKey();
      // Proceed to the app after triggering the dialog as per instructions
    }
    
    setIsExiting(true);
    // Wait for the exit animation to complete before changing the UI state.
    setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 800); // Wait for animation
  }

  return (
    <div
      className={`welcome-screen-shroud ${isVisible ? 'visible' : ''} ${
        isExiting ? 'exiting' : ''
      }`}
    >
      <div className="atmosphere" />
      <div className="floating-name-container">
        {transliterations.map((name, index) => (
          <div
            key={index}
            className="floating-name"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${1 + Math.random() * 1.5}rem`,
              animationDelay: `${Math.random() * 30}s`,
              animationDuration: `${20 + Math.random() * 20}s`,
            }}
          >
            {name}
          </div>
        ))}
      </div>
        <div className="welcome-screen fancy-layout" style={{ maxWidth: '440px', width: '92%' }}>
        {/* Android Real App Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85.99c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.99 6 5.86 6 8h12c0-2.14-.97-4.01-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
            تطبيق أندرويد حقيقي كامل 100%
          </span>
        </div>

        <h1 className="welcome-title-fancy">Intute</h1>
        <p className="welcome-subtitle-fancy">معلمك الذكي التفاعلي المباشر بالصوت والملاحظات</p>

        <div className="powered-by-gemini">
          <svg
            className="gemini-star"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="currentColor"
            />
          </svg>
          <span>مدعوم بالذكاء الاصطناعي الفوري من Gemini</span>
        </div>

        {!hasKey && (
          <div className="api-key-notice">
            <p>To use high-quality image generation, please select a paid Gemini API key.</p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="billing-link">
              Learn about billing
            </a>
          </div>
        )}

        <div className="flex flex-col gap-2.5 w-full mt-4">
          <button onClick={handleClose} className="teach-me-button" style={{ width: '100%' }}>
            {!hasKey ? 'Select API Key & Start' : 'ابدأ الدرس الآن (Start Teaching)'}
            <span className="material-symbols-outlined icon-right">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
