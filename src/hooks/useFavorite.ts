import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

export function useFavorite(ticker: string, companyName: string) {
  const { user, profile, toggleFavorite } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [pending, setPending] = useState(false);

  const isFavorite = profile?.favorite_tickers.includes(ticker) ?? false;

  const toggle = async (e?: { stopPropagation: () => void; preventDefault: () => void }) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!user) {
      openAuthModal();
      return;
    }

    setPending(true);
    await toggleFavorite(ticker, companyName);
    setPending(false);
  };

  return { isFavorite, pending, toggle };
}
