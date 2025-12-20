import React, { useState, FormEvent } from 'react';
import { Sparkles, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';
import { Button } from '../Button';

interface MagicLinkViewProps {
  onSwitch: (view: 'login' | 'signup' | 'magicLink') => void;
}

export const MagicLinkView: React.FC<MagicLinkViewProps> = ({ onSwitch }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    // Magic Link is not yet configured in PocketBase
    // This is a placeholder for future implementation
    setTimeout(() => {
      setIsLoading(false);
      showToast('Magic link feature coming soon! Please use password login for now.', 'info');
      setTimeout(() => onSwitch('login'), 2000);
    }, 1000);

    // Future implementation:
    // try {
    //   await pb.collection('users').requestVerification(email);
    //   setSent(true);
    //   showToast('Magic link sent! Check your email', 'success');
    // } catch (error: any) {
    //   showToast('Failed to send magic link', 'error');
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
      {/* Back Button */}
      <button
        onClick={() => onSwitch('login')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-aura-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>

      {!sent ? (
        <>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-aura-300 to-aura-500 rounded-2xl mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-aura-900 mb-1">Magic Link</h1>
            <p className="text-gray-600">We'll send you a secure login link</p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-aura-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border ${
                    error ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300 transition-all`}
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-6">
              Send Magic Link
            </Button>
          </form>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-aura-50 border border-aura-200 rounded-xl">
            <p className="text-sm text-aura-800">
              <strong>Coming Soon:</strong> Magic Link authentication is being configured.
              Please use password login for now.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Success State */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-aura-900 mb-2">Check your email!</h2>
            <p className="text-gray-600 mb-2">
              We sent a magic link to:
            </p>
            <p className="text-aura-600 font-medium mb-6">{email}</p>
            <p className="text-sm text-gray-500">
              Click the link in your email to sign in. The link expires in 15 minutes.
            </p>
          </div>

          {/* Resend Button */}
          <Button
            onClick={() => setSent(false)}
            variant="outline"
            className="w-full"
          >
            Send Another Link
          </Button>
        </>
      )}
    </div>
  );
};
