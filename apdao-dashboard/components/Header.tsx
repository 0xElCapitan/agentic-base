'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { formatDateTime, truncateAddress } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  lastUpdated: string;
}

const DONATION_ADDRESS = "0x2677A37cf5E882C6e368B747A28a458C5d962ea0";

export default function Header({ lastUpdated }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(DONATION_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-warning flex items-center justify-center">
              <span className="text-background font-bold text-lg">ap</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">apDAO Treasury</h1>
              <p className="text-sm text-text-secondary">
                Last updated: {formatDateTime(lastUpdated)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-colors"
            >
              {copied ? (
                <span className="text-success">Copied!</span>
              ) : (
                <>
                  <span className="text-sm">Donate BERA</span>
                  <span className="text-text-secondary text-sm">
                    {truncateAddress(DONATION_ADDRESS)}
                  </span>
                  <Copy className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
