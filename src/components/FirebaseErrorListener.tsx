
'use client';
import React, { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      setError(err);
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md animate-in slide-in-from-right-4 duration-300">
      <div className="bg-destructive text-destructive-foreground p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Database Access Denied</h3>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">
              Firebase blocked an operation at: <span className="font-mono bg-black/20 px-1 rounded">{error.context?.path}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => setError(null)}
                className="text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
