import { Suspense } from 'react';
import { Card } from '@burcum/ui';
import VerifyEmailContent from './VerifyEmailContent';

function LoadingFallback() {
  return (
    <Card variant="glass" padding="lg">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔮</div>
        <h1 className="text-2xl font-bold mb-2">Yükleniyor...</h1>
        <p className="text-gray-400">Lütfen bekleyin.</p>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
