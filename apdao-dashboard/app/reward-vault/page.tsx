'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RewardVaultPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Reward Vault Details
        </h1>
        <p className="text-text-secondary mb-8">
          Coming in Phase 2
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
