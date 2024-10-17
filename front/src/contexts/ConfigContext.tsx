import React, { useState, createContext } from 'react';
import { SetState } from './types';

interface ConfigContextType {
    hideQuizChoices:boolean,
    setHideQuizChoices:SetState<boolean>,
}

export const ConfigContext = createContext<ConfigContextType|null>(null);

export function ConfigContextProvider({children}) {
    const [hideQuizChoices, setHideQuizChoices] = useState<boolean>(false);
    
    return (
        <ConfigContext.Provider
            value={{
                hideQuizChoices, setHideQuizChoices,
            }}
        >
            {children}
        </ConfigContext.Provider>
    )
}