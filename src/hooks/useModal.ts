import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<any>(null);

  const open = useCallback((modalData?: any) => {
    setData(modalData || null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Don't reset data immediately to allow for smooth closing animations
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    open,
    close,
    data,
  };
};
