import { createContext, useContext, useState, type ReactNode } from 'react';
import ContactModal from '../components/contact/ContactModal';
import type { ContactType } from '../lib/contact';

interface ContactModalContextValue {
  openContactModal: (type: ContactType) => void;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ContactType | null>(null);

  return (
    <ContactModalContext.Provider value={{ openContactModal: setType }}>
      {children}
      {type && <ContactModal type={type} onClose={() => setType(null)} />}
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error('useContactModal은 ContactModalProvider 내부에서만 사용할 수 있어요.');
  return ctx;
}
