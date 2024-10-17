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
import LocalAPI from 'api/local';

function HomePage() {
    const memoryContext = useContextForce(MemoryContext);
    const eventContext = useContextForce(EventContext);
    const [inputWord, setInputWord] = useState('');
    const inputRef = useRef<any>(null);

    const sendSearchQuery = async (query:string) => {
        if (query.length === 0) return;
        
        const meanings = await LocalInteractive.searchWord(query);
        if (meanings) {
            const wordData = {
                id: -1,
                word: query,
                data: meanings,
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
                        }}
                        onClick={ (e) => sendSearchQuery(inputWord) }
                    >
                        <GoogleFontIcon
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
                            <QuizPage
                                quizGenerator={
                                    new QuizGenerator({
                                        onPull(offset:number, limit:number) {
                                            return LocalAPI.getWords(
                                                [
                                                    {
                                                        // 등장 횟수 10회 이하인 단어 선택
                                                        // 낮은 등장 빈도 순 정렬 후 5개 단위 셔플
                                                        highFrequencyLimit: 10,
                                                        lowQuizFrequency: true,
                                                        shuffle: true,
                                                        shuffleGroupSize: 5,
                                                    },
                                                    {
                                                        // 오답률 10% 이상인 단어 선택
                                                        // 낮은 등장 빈도 & 오답률 높은 순 정렬 후 5개 단위 셔플
                                                        lowIncorrectRateLimit: 10,
                                                        lowQuizFrequency: true,
                                                        highQuizIncorrect: true,
                                                        shuffle: true,
                                                        shuffleGroupSize: 5,
                                                    }
                                                ],
                                                {
                                                    // 두 그룹을 번갈아가며 단어 선택
                                                    order: 'interleave'
                                                }
                                            );
                                        },
                                        onQuizCorrect(word:string) {
                                            LocalAPI.addWordScoreCorrect(word);
                                        },
                                        onQuizIncorrect(word:string) {
                                            LocalAPI.addWordScoreIncorrect(word);
                                        },
                                    })
                                }
                            />
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