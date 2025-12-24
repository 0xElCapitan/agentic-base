'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { formatDateTime, truncateAddress } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  lastUpdated: string;
}

const DONATION_ADDRESS = "0x89009269b6Cc5D8092E1f381476A46510C0F0E20";

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
            <div className="relative group">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent transition-colors"
              >
                {copied ? (
                  <span className="text-success">Copied!</span>
                ) : (
                  <>
                    <span className="text-sm font-medium">Donate and Support us</span>
                    <span className="text-text-secondary text-sm">
                      {truncateAddress(DONATION_ADDRESS)}
                    </span>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Support by donating to help build better public goods for the bees.
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
