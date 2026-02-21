
'use client';
import React, { useState, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { SettingsContext } from '@/context/SettingsContext';
import { Building, Lock, Mail, UserPlus, LogIn, Loader2, KeyRound, ChevronLeft, CheckCircle } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const { language, translations } = useContext(SettingsContext);
  const T = translations[language];

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMessage(T.resetLinkSent);
        // After sending reset link, we might want to switch back to login after a few seconds
        setTimeout(() => setMode('login'), 5000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary p-3 rounded-2xl mb-4 shadow-lg shadow-primary/20">
              {mode === 'forgot' ? <KeyRound size={32} className="text-primary-foreground" /> : <Building size={32} className="text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">MIM Construction Pro</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'login' ? (language === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Login to your account') : 
               mode === 'signup' ? (language === 'bn' ? 'একটি নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create a new account') :
               (language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset your password')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium rounded-lg flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle size={14} />
                {message}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-muted-foreground">{language === 'bn' ? 'ইমেল' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-muted-foreground">{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                      className="text-xs font-bold text-primary hover:underline underline-offset-4"
                    >
                      {T.forgotPassword}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                    required={mode !== 'forgot'}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? <LogIn size={20} /> : mode === 'signup' ? <UserPlus size={20} /> : <Mail size={20} />)}
              {mode === 'login' ? (language === 'bn' ? 'লগইন করুন' : 'Login') : 
               mode === 'signup' ? (language === 'bn' ? 'সাইন আপ করুন' : 'Sign Up') : 
               T.sendResetLink}
            </button>

            {mode === 'forgot' && (
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="w-full py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronLeft size={16} />
                {T.backToLogin}
              </button>
            )}
          </form>

          {mode !== 'forgot' && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                {mode === 'login' ? (language === 'bn' ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?") : (language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : "Already have an account?")}{' '}
                <button 
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
                  className="text-primary font-bold hover:underline underline-offset-4"
                >
                  {mode === 'login' ? (language === 'bn' ? 'সাইন আপ করুন' : 'Sign Up') : (language === 'bn' ? 'লগইন করুন' : 'Login')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
