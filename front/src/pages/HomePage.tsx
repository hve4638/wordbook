import { useEffect, useRef, useState } from 'react';
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import GoogleFontIcon from 'components/GoogleFontIcon';
import { EventContext, useContextForce } from 'contexts';
import { MemoryContext } from 'contexts';
import LocalInteractive from 'api/local';
import SearchPage from 'pages/SearchPage';
import BookmarkPage from 'pages/BookmarkPage';
import QuizPage from 'pages/QuizPage';
import { QuizGenerator } from 'features/quiz';

function HomePage() {
    const memoryContext = useContextForce(MemoryContext);
    const eventContext = useContextForce(EventContext);
    const [inputWord, setInputWord] = useState('');
    const inputRef = useRef<any>(null);

    const sendSearchQuery = async (query:string) => {
        if (query.length === 0) return;
        const word = query.trim();
        
        const meanings = await LocalInteractive.searchWord(word);
        if (meanings) {
            const wordData = {
                id: -1,
                word: word,
                meanings: meanings,
            } as WordData;

            eventContext.pushPage(<SearchPage wordData={wordData}/>);
        }
    }

    useEffect(() => {
        inputRef.current?.focus();
    }, [memoryContext.visibleCount]);

    return (
        <div
            className='column fill'
        >
            <header className='noflex row' style={{margin:'6px'}}>
                <h2 style={{fontSize:'0.6em', fontWeight:'bold', padding: '3px 0px 0px 3px'}}>
                    Wordbook
                </h2>
                <div className='flex'></div>
                <div>
                    <GoogleFontIconButton
                        className='app-nodrag undraggable fonticon'
                        value='menu'
                        onClick={()=>{
                            
                        }}
                    />
                </div>
            </header>
            <div className='row main-center'>
                <div
                    className='app-nodrag row'
                    style={{
                        width: '80%',
                        height: '1rem',
                        margin: '8px',
                    }}
                >
                    <input
                        className='flex'
                        style={{
                            padding: '4px',
                            fontSize: '0.5rem',
                        }}
                        ref={inputRef}
                        value={inputWord}
                        onChange={(e)=>{
                            setInputWord(e.target.value);
                        }}
                        onKeyDown={(e)=>{
                            if (e.key === 'Enter') {
                                sendSearchQuery(inputWord);
                            }
                        }}
                    />
                    <button
                        style={{
                            marginLeft: '6px',
                            width : '1rem',
                            height : '1rem',
                            cursor: 'pointer',
                        }}
                        onClick={ (e) => sendSearchQuery(inputWord) }
                    >
                        <GoogleFontIcon
                            className='clickable'
                            style={{fontSize:'0.8rem'}}
                            value='send'
                        />
                    </button>
                </div>
            </div>
            <div className='loading-container flex row center'>
            </div>
            <footer className='row noflex' style={{margin:'6px'}}>
                <GoogleFontIconButton
                    className='app-nodrag undraggable noflex fonticon clickable'
                    value='quiz'
                    onClick={()=>{
                        eventContext.pushPage(
                            <QuizPage/>
                        );
                    }}
                />
                <div className='flex'/>
                <GoogleFontIconButton
                    className='app-nodrag undraggable noflex fonticon clickable'
                    value='history'
                />
                <GoogleFontIconButton
                    className='app-nodrag undraggable noflex fonticon clickable'
                    value='collections_bookmark'
                    onClick={()=>{
                        eventContext.pushPage(<BookmarkPage/>);
                    }}
                />
            </footer>
        </div>
    )
}

export default HomePage;