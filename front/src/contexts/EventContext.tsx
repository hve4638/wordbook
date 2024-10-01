import React, { useState, createContext, useEffect, ReactElement, useContext } from 'react';
import { useContextForce } from './hook';
import { MemoryContext } from './MemoryContext';

interface EventContextType {
    pushPage: (page:ReactElement) => void;
    popPage: () => void;
}

export const EventContext = createContext<EventContextType|null>(null);

export function EventContextProvider({children}) {
    const memoryContext = useContextForce(MemoryContext);
    const pushPage = (page:ReactElement) => {
        memoryContext.setPageStack((value) => [...value, page]);
    }
    const popPage = () => {
        memoryContext.setPageStack((value) => {
            const newValue = [...value];
            newValue.pop();
            return newValue;
        });
    }
    
    return (
        <EventContext.Provider
            value={{
                pushPage,
                popPage
            }}
        >
            {children}
        </EventContext.Provider>
    )
}