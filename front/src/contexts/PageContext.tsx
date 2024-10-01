import React, { useState, createContext, useEffect } from 'react';
import { SetState } from './types';

export const CurrentPages = {
    'HOME': 'HOME',
    'SEARCH': 'SEARCH',
    'BOOKMARK': 'BOOKMARK',
    'HISTORY': 'HISTORY',
    'QUIZ': 'QUIZ',
} as const;
type CurrentPages = typeof CurrentPages[keyof typeof CurrentPages];

interface PageContextType {
    currentPage:CurrentPages,
    setCurrentPage:SetState<CurrentPages>,
}

export const PageContext = createContext<PageContextType|null>(null);

export function PageContextProvider({children}) {
    const [currentPage, setCurrentPage] = useState<CurrentPages>(CurrentPages.HOME);
    
    return (
        <PageContext.Provider
            value={{
                currentPage,
                setCurrentPage
            }}
        >
            {children}
        </PageContext.Provider>
    )
}