import { useEffect, useMemo, useState } from 'react';
import { useContextForce, EventContext, ConfigContext, MemoryContext } from 'contexts';
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import { QuizGenerator, IQuiz } from 'features/quiz';
import SearchPage from 'pages/SearchPage';
import GoogleFontIcon from 'components/GoogleFontIcon';

const quizGenerator = new QuizGenerator();

function QuizPage() {
    const configContext = useContextForce(ConfigContext);
    const eventContext = useContextForce(EventContext);
    const memoryContext = useContextForce(MemoryContext);

    const {
        quiz,
        lastQuizIndex
    } = memoryContext;

    const [refreshQuizPing, setRefreshQuizPing] = useState(0);
    const [currentHide, setCurrentHide] = useState(false);

    const refreshPage = () => setRefreshQuizPing(prev => prev + 1);

    const currentQuiz = useMemo(
        ()=>{
            if (quiz.length === 0 || lastQuizIndex < 0) {
                return null;
            }
            return quiz[lastQuizIndex]
        },
        [quiz, lastQuizIndex]
    );

    const makeNewQuiz = async () => {
        const newQuiz = await quizGenerator.generate(1000);
        memoryContext.setQuiz(newQuiz);
        memoryContext.setLastQuizIndex(0);

        if (newQuiz.length > 0) {
            setRefreshQuizPing(refreshQuizPing + 1);
        }
    }
    
    const previousQuiz = () => {
        if (currentQuiz !== null && lastQuizIndex > 0) {
            memoryContext.setLastQuizIndex(prev => prev - 1);
        }
    }
    
    const nextQuiz = () => {
        if (currentQuiz == null || currentQuiz.finished) {
            memoryContext.setLastQuizIndex(prev => prev + 1);
        }
    }

    const openSearchPage = () => {
        if (!currentQuiz?.finished) return;

        eventContext.pushPage(<SearchPage wordData={currentQuiz.correctWord}/>)
    }

    const selectAnswer = (index:number) => {
        currentQuiz?.selectAnswer(index);
        refreshPage();
    }

    const toggleHide = () => {
        configContext.setHideQuizChoices(!configContext.hideQuizChoices);
        setCurrentHide(!configContext.hideQuizChoices);
    }

    const backToHome = () => {
        eventContext.popPage();
    }

    useEffect(()=>{
        if (quiz.length === 0 || lastQuizIndex < 0) {
            makeNewQuiz();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                backToHome();
            }
            if (event.ctrlKey && event.key === 'h') {
                toggleHide();
            }
            else if (currentHide) {
                switch(event.key) {
                    case 'Enter':
                        setCurrentHide(false);
                        break;
                }
            }
            else {
                switch(event.key) {
                    case '1':
                        selectAnswer(0);
                        break;
                    case '2':
                        selectAnswer(1);
                        break;
                    case '3':
                        selectAnswer(2);
                        break;
                    case '4':
                        selectAnswer(3);
                        break;
                    case 'e':
                        openSearchPage();
                        break;
                    case 'ArrowRight':
                    case 'Enter':
                        nextQuiz();
                        break;
                    case 'ArrowLeft':
                        previousQuiz();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <div
            className='column fill'
            style={{ position: 'relative' }}
        >
            <div
                className='absolute row'
                style={{
                    top: '0px', left: '0px',
                    alignItems: 'flex-end',
                }}
            >
                <h2 style={{margin:'8px'}}>Quiz</h2>
                <span
                    style={{
                        fontSize: '0.3em',
                        fontWeight: '500',
                        margin: '10px 0px',
                    }}
                >
                    ({memoryContext.lastQuizIndex+1}/{memoryContext.quiz.length})
                </span>
                
                <GoogleFontIconButton
                    className='app-nodrag undraggable fonticon clickable'
                    style={{
                        margin: '4px',
                        top: '0px',
                        right: '0px',
                        fontSize: '0.8em'
                    }}
                    value='restart_alt'
                    onClick={() => makeNewQuiz()}
                />
            </div>

            {
                currentQuiz != null &&
                <>
                    <div
                        className='row noflex' 
                        style={{ justifyContent: 'center', padding: '10px' }}
                    >
                        <span
                            className='app-nodrag undraggable'
                            style={{ cursor: 'pointer' }}
                            onClick={
                                ()=>openSearchPage()
                            }
                        >
                            {currentQuiz.correctWord.word}
                        </span>
                    </div>
                    {
                        currentHide &&
                        <div
                            className='flex center'
                        >
                            <div
                                className='column app-nodrag undraggable clickable'
                                style={{
                                    cursor: 'pointer',
                                    padding: '0px 0px 36px 0px'
                                }}
                                onClick={()=>setCurrentHide(false)}
                            >
                                <GoogleFontIcon
                                    className='sub'
                                    value='visibility_off'
                                />
                                <span
                                    className='sub'
                                    style={{
                                        fontSize: '0.45em',
                                        fontWeight: '400',
                                    }}
                                >
                                    Press Enter to show the choices
                                </span>
                            </div>
                        </div>
                    }
                    {
                        !currentHide &&
                        <div
                            style={{
                                margin : '0px 5px 5px 5px'
                            }}
                        >
                            <div
                                className='column flex app-nodrag undraggable'
                                style={{
                                    flexWrap: 'wrap',
                                }}
                            >
                                {
                                    currentQuiz.choices.map((choice, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={
                                                    `choice-container`
                                                    + (
                                                        choice.show
                                                        ? (choice.correct ? ' correct' : ' incorrect')
                                                        : ''
                                                    )
                                                }
                                                onClick={() => selectAnswer(index)}
                                            >
                                                <span className='choice'>{index+1}. {choice.meaning.to}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    }
                </>
            }



            <GoogleFontIconButton
                className='app-nodrag undraggable fonticon clickable absolute'
                style={{
                    margin: '4px',
                    top: '0px',
                    right: '0px'
                }}
                value='arrow_back'
                onClick={() => backToHome()}
            />
            <GoogleFontIconButton
                className={
                    'app-nodrag undraggable fonticon clickable absolute'
                    + (
                        configContext.hideQuizChoices 
                        ? ' enabled'
                        : ' disabled'
                    )
                }
                style={{
                    margin: '6px',
                    bottom: '0px',
                    left: '0px',
                    fontSize: '0.8em'
                }}
                value='visibility_off'
                onClick={() => {
                    toggleHide();
                }}
            />
            <div
                className='absolute row'
                style={{
                    bottom: '0px',
                    right: '0px',
                    margin: '4px'
                }}
            >
                {
                    lastQuizIndex > 0 &&      
                    <GoogleFontIconButton
                        className='app-nodrag undraggable fonticon clickable'
                        value='arrow_left'
                        onClick={() => previousQuiz()}
                    />
                }
                <GoogleFontIconButton
                    className='app-nodrag undraggable fonticon clickable'
                    value='arrow_right'
                    onClick={() => nextQuiz()}
                />
            </div>
        </div>
    );
}

export default QuizPage;