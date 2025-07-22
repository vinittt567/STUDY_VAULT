import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  console.log('📝 AuthPage rendered - mode:', isLogin ? 'login' : 'signup');

  return (
    <div className="min-h-screen">
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignupForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;