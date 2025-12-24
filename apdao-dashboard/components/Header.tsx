'use client';

import { useState } from 'react';

export default function Header() {
  const [copied, setCopied] = useState(false);
  const donationAddress = '0x89009269b6Cc5D8092E1f381476A46510C0F0E20';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(donationAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-sm text-white">
              ap
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">apDAO Treasury</h1>
              <p suppressHydrationWarning className="text-sm text-text-secondary">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
            title="Support by donating to help build better public goods for the bees."
          >
            <span>Donate BERA</span>
            <span className="text-xs opacity-75">{donationAddress.slice(0, 6)}...{donationAddress.slice(-4)}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4-4l2 2m0 0l2-2m-2 2V4" />
            </svg>
            {copied && <span className="ml-2 text-xs">Copied!</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
