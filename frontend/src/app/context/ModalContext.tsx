'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isQuoteOpen: boolean;
    openQuote: () => void;
    closeQuote: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const openQuote = () => setIsQuoteOpen(true);
    const closeQuote = () => setIsQuoteOpen(false);

    return (
        <ModalContext.Provider value={{ isQuoteOpen, openQuote, closeQuote }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
