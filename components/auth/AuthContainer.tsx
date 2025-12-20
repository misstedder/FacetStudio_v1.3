import React, { useState } from 'react';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';
import { MagicLinkView } from './MagicLinkView';

type AuthView = 'login' | 'signup' | 'magicLink';

export const AuthContainer: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-aura-50 via-aura-100 to-aura-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authView === 'login' && <LoginView onSwitch={setAuthView} />}
        {authView === 'signup' && <SignupView onSwitch={setAuthView} />}
        {authView === 'magicLink' && <MagicLinkView onSwitch={setAuthView} />}
      </div>
    </div>
  );
};
