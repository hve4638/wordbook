import React, { useEffect, useState } from 'react';
import { EventContext, MemoryContext, useContextForce } from 'contexts';
import LocalAPI from 'api/local';

import HomePage from './pages/HomePage';
import SearchPage from 'pages/SearchPage';
import { WordData } from 'types/words';

const DEV_MODE = (process.env['REACT_APP_DEV'] === 'TRUE');

function App() {
    const memoryContext = useContextForce(MemoryContext);
    const eventContext = useContextForce(EventContext);
    
    useEffect(()=>{
        if (memoryContext.pageStack.length === 0) {
            eventContext.pushPage(<HomePage/>);
        }
        
        window.electron.onReceiveClipboard((event, word, force) => {
            LocalAPI.searchWord(word)
                .then((meanings) => {
                    if (meanings) {
                        const wordData:WordData = {
                            id: -1,
                            word: word,
                            data: meanings,
                        }
            
                        eventContext.pushPage(<SearchPage wordData={wordData}/>);
                    }
                });
        });
        window.electron.onVisible((event) => {
            memoryContext.setVisibleCount((value)=>value+1);
        });
        window.electron.onHide((event) => {
            memoryContext.setHideCount((value)=>value+1);
        });
        
        const handleKeyDown = (event) => {
            if (event.key === 'F5') {
                window.location.reload();
            }
        }

        if (DEV_MODE) {
            window.addEventListener('keydown', handleKeyDown);
    
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, []);

    return (
        <div
            className="app-drag theme-light column fill"
        >
            {
                memoryContext.pageStack.length > 0 &&
                memoryContext.pageStack.at(-1)
            }
        </div>
    );
}

export default App;

