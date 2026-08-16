import { createContext, useContext, useState, type ReactNode } from 'react';
import AuthModal from '../components/auth/AuthModal';

interface AuthModalContextValue {
  openAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal: () => setIsOpen(true) }}>
      {children}
      {isOpen && <AuthModal onClose={() => setIsOpen(false)} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal은 AuthModalProvider 내부에서만 사용할 수 있어요.');
  return ctx;
}
