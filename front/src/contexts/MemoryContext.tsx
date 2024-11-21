import React, { useState, createContext, ReactElement } from 'react';
import { SetState } from './types';
import { IQuiz } from 'features/quiz';

interface MemoryContextType {
    currentWordData:WordData,
    setCurrentWordData:SetState<WordData>,
    visibleCount:number,
    setVisibleCount:SetState<number>,
    hideCount:number,
    setHideCount:SetState<number>,

    pageStack:ReactElement[],
    setPageStack:SetState<ReactElement[]>

    quiz:IQuiz[],
    setQuiz:SetState<IQuiz[]>,
    lastQuizIndex:number,
    setLastQuizIndex:SetState<number>,
}

export const MemoryContext = createContext<MemoryContextType|null>(null);

export function MemoryContextProvider({children}) {
    const [currentWordData, setCurrentWordData] = useState<WordData>({id:0, word:'', data:[]} as any);
    const [visibleCount, setVisibleCount] = useState<number>(0);
    const [hideCount, setHideCount] = useState<number>(0);
    const [pageStack, setPageStack] = useState<ReactElement[]>([]);
    const [quiz, setQuiz] = useState<IQuiz[]>([]);
    const [lastQuizIndex, setLastQuizIndex] = useState(-1);
    
    return (
        <MemoryContext.Provider
            value={{
                currentWordData, setCurrentWordData,
                visibleCount, setVisibleCount,
                hideCount, setHideCount,
                pageStack, setPageStack,
                quiz, setQuiz,
                lastQuizIndex, setLastQuizIndex,
            }}
        >
            {children}
        </MemoryContext.Provider>
    )
}