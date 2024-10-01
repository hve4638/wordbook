import { useEffect, useState } from 'react';
import { useContextForce, EventContext, ConfigContext } from 'contexts';
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import { QuizGenerator, IQuiz, QuizChoices } from 'features/quiz';
import SearchPage from 'pages/SearchPage';
import GoogleFontIcon from 'components/GoogleFontIcon';

interface QuizPageProps {
    quizGenerator: QuizGenerator;
}

function QuizPage({quizGenerator}:QuizPageProps) {
    const configContext = useContextForce(ConfigContext);
    const eventContext = useContextForce(EventContext);
    const [currentQuizFinished, setCurrentQuizFinished] = useState(false);
    const [nextQuizPing, setNextQuizPing] = useState(0);
    const [quiz, setQuiz] = useState<IQuiz|undefined>();
    const [quizChoices, setQuizChoices] = useState<QuizChoices>([]);
    const [currentHide, setCurrentHide] = useState(false);

    const nextQuiz = () => {
        setNextQuizPing((value)=>value+1);
    }

    const selectChoice = (index:number) => {
        if (quiz == null || currentQuizFinished) return;
        const result = quiz.select(index);
        
        if (result) {
            const newChoices = [...quizChoices];
            newChoices[result.correctIndex].show = true;
            newChoices[result.selectedIndex].show = true;
            
            setQuizChoices(newChoices);
            setCurrentQuizFinished(true);
        }
    }

    const toggleHide = () => {
        configContext.setHideQuizChoices(!configContext.hideQuizChoices);
        setCurrentHide(!configContext.hideQuizChoices);
    }

    const backToHome = () => {
        eventContext.popPage();
    }

    useEffect(()=>{
        setCurrentQuizFinished(false);
        quizGenerator.next()
            .then((nextQuiz)=>{
                setQuiz(nextQuiz);
                setQuizChoices(nextQuiz.choices)
                setCurrentHide(configContext.hideQuizChoices);
            });
    }, [nextQuizPing]);

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
                        if (!currentQuizFinished) selectChoice(0);
                        break;
                    case '2':
                        if (!currentQuizFinished) selectChoice(1);
                        break;
                    case '3':
                        if (!currentQuizFinished) selectChoice(2);
                        break;
                    case '4':
                        if (!currentQuizFinished) selectChoice(3);
                        break;
                    case 'Enter':
                        if (currentQuizFinished) nextQuiz();
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
                className='absolute'
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
                    ({quizGenerator.currentIndex}/{quizGenerator.pulledWordsLength})
                </span>
            </div>

            {
                quiz != null &&
                <>
                    <div
                        className='row noflex' 
                        style={{ justifyContent: 'center', padding: '10px' }}
                    >
                        <span
                            className='app-nodrag undraggable'
                            style={{ cursor: 'pointer' }}
                            onClick={
                                ()=>{
                                    if (!currentQuizFinished) return;
                                    eventContext.pushPage(<SearchPage wordData={quiz.correct}/>)
                                }
                            }
                        >
                            {quiz.correct.word}
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
                                    quizChoices.map((choice, index) => {
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
                                                onClick={() => selectChoice(index)}
                                            >
                                                <span className='choice'>{index+1}. {choice.meaning}</span>
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
            {
                currentQuizFinished &&
                <GoogleFontIconButton
                    className='app-nodrag undraggable fonticon clickable absolute'
                    style={{
                        margin: '4px',
                        bottom: '0px',
                        right: '0px'
                    }}
                    value='arrow_right'
                    onClick={() => nextQuiz()}
                />
            }
        </div>
    );
}

export default QuizPage;