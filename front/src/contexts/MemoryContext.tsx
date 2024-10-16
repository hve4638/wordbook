import React, { useState, createContext, useEffect, ReactElement } from 'react';
import { SetState } from './types';

interface MemoryContextType {
    currentWordData:WordData,
    setCurrentWordData:SetState<WordData>,
    visibleCount:number,
    setVisibleCount:SetState<number>,
    hideCount:number,
    setHideCount:SetState<number>,

    pageStack:ReactElement[],
    setPageStack:SetState<ReactElement[]>
}

export const MemoryContext = createContext<MemoryContextType|null>(null);

export function MemoryContextProvider({children}) {
    const [currentWordData, setCurrentWordData] = useState<WordData>({id:0, word:'', data:[]});
    const [visibleCount, setVisibleCount] = useState<number>(0);
    const [hideCount, setHideCount] = useState<number>(0);
    const [pageStack, setPageStack] = useState<ReactElement[]>([]);
    
    return (
        <MemoryContext.Provider
            value={{
                currentWordData, setCurrentWordData,
                visibleCount, setVisibleCount,
                hideCount, setHideCount,
                pageStack, setPageStack,
            }}
        >
            {children}
        </MemoryContext.Provider>
    )
}