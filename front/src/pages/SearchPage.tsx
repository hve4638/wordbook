import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useContextForce, EventContext } from 'contexts';
import LocalAPI from 'api/local'
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import NaverDictIcon from 'assets/icons/naver-dict.svg';
import GoogleFontIcon from 'components/GoogleFontIcon';
import {EditWordMeaningModal} from 'components/modals';

interface SearchPageProps {
    wordData: WordData;
}

function SearchPage({wordData}:SearchPageProps) {
    const eventContext = useContextForce(EventContext);
    const [previousBookmarkAdded, setPreviousBookmarkAdded] = useState(false);
    const [bookmarkAdded, setBookmarkAdded] = useState(false);
    const [meanings, setMeanings] = useState<WordMeaning[]>(wordData.meanings);
    const word = useMemo(()=>wordData.word.trim(), [wordData.word]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [meaningToEdit, setMeaningToEdit] = useState<WordMeaning>();

    const backToHome = () => {
        if (previousBookmarkAdded !== bookmarkAdded) {
            if (bookmarkAdded) {
                LocalAPI.addBookmark(word);
            }
            else {
                LocalAPI.deleteBookmark(word);
            }
        }
        if (wordData.meanings !== meanings) {
            LocalAPI.editWord(word, meanings);
        }

        eventContext.popPage();
    }

    const toggleBookmark = async () => {
        if (bookmarkAdded) {
            setBookmarkAdded(false);
        }
        else {
            setBookmarkAdded(true);
        }
    }

    const toggleMeaningStar = (meaning:WordMeaning) => {
        // 이 방식은 원본이 바뀌는 사이드이팩트가 있으므로 필요시 로직 변경 필요
        meaning.star = !meaning.star;
        setMeanings([...meanings]);
    }

    useLayoutEffect(() => {
        setMeanings([...wordData.meanings]);
    }, [wordData]);

    useEffect(() => {
        // 북마크 여부 확인
        LocalAPI
            .getBookmark(word)
            .then(result => {
                if (result) {
                    setBookmarkAdded(true);
                    setPreviousBookmarkAdded(true);
                }
                else {
                    setBookmarkAdded(false);
                    setPreviousBookmarkAdded(false);
                }
            });
    }, []);
    
    useEffect(() => {
        // Ctrl + S : 북마크 토글
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                toggleBookmark();
            }
            if (event.key === 'Escape') {
                backToHome()
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
                style={{
                    fontSize: '0.8em',
                    margin: '8px 16px 16px 16px',
                    fontWeight: 'bold',
                }}
            >
                {wordData.word}
            </div>
            <div
                className='column scrollbar meaning-container'
                style={{
                    overflowY: 'auto',
                    margin: '0px 16px',
                    paddingLeft: '8px'
                }}
                >
                {
                    meanings.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className='app-nodrag row undraggable'
                            >
                                <span
                                    className={
                                        'meaning' + (item.star ? ' priority' : '')
                                    }
                                    onClick={()=>toggleMeaningStar(item)}
                                    onMouseDown={(e)=>{
                                        if (e.button === 1) {
                                            if (item.custom) {
                                                const newMeanings = meanings.filter((_, i) => i !== index);
                                                
                                                setMeanings(newMeanings);
                                            }
                                        }
                                    }}
                                >
                                    <span>
                                        {index + 1}. {item.to} <i>{item.fromType}</i>
                                    </span>
                                    
                                </span>
                                {
                                    item.from !== word &&
                                    <span
                                        className='another-word'
                                        style={{
                                            marginLeft: '8px',  
                                        }}
                                    >
                                        {item.from}
                                    </span>
                                }
                            </div>
                        )
                    })
                }
                <div
                    className='app-nodrag secondary-text clickable'
                    style={{
                        marginTop : '0.3em',
                        paddingLeft: '1em',
                        fontSize: '0.9em',
                    }}
                >
                    <i
                        onClick={()=>{
                            const newMeaning:WordMeaning = {
                                from: wordData.word,
                                fromType: '',
                                to: '',
                                star: false,
                                custom: true,
                            }
                            setMeaningToEdit(newMeaning);
                            setOpenEditModal(true);
                        }}
                    >새 뜻 추가...</i>
                </div>
            </div>

            <div
                className='app-nodrag absolute'
                style={{
                    bottom: '0px',
                    left: '0px',
                }}
            >
                <GoogleFontIcon
                    value='dictionary'
                    className='clickable hover-animation undraggable'
                    style={{
                        fontSize: '24px',
                        padding : '0px 0px 8px 8px',
                    }}
                    onClick={
                        ()=>{
                            LocalAPI.openBrowser(`https://www.wordreference.com/enko/${wordData.word}`);
                        }
                    }
                />
                <GoogleFontIcon
                    value='volume_up'
                    className='clickable hover-animation undraggable'
                    style={{
                        fontSize: '24px',
                        padding : '0px 0px 8px 8px',
                    }}
                    onClick={
                        ()=>{
                            LocalAPI.openBrowser(`https://www.google.com/search?q=${wordData.word}+pronunciation`);
                        }
                    }
                />
                <img
                    className='clickable hover-animation undraggable'
                    src={NaverDictIcon}
                    alt='naver-dict'
                    width='24px'
                    style={{
                        margin : '0px 0px 8px 8px',
                    }}
                    onClick={
                        ()=>{
                            LocalAPI.openBrowser(`https://dict.naver.com/dict.search?query=${wordData.word}`);
                        }
                    }
                />
            </div>
            <GoogleFontIconButton
                className='app-nodrag undraggable fonticon clickable'
                style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    margin: '4px'
                }}
                value='arrow_back'
                onClick={() => backToHome()}
            />
            <GoogleFontIconButton
                className={
                    'app-nodrag undraggable fonticon clickable'
                    + (bookmarkAdded ? ' bookmarked' : '')
                }
                style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    margin: '4px',
                    padding: '2px',
                    fontSize: '0.9em'
                }}
                value={bookmarkAdded ? 'bookmark_added' : 'bookmark'}
                onClick={() => toggleBookmark()}
            />
            {
                openEditModal &&
                <EditWordMeaningModal
                    meaning={meaningToEdit!}
                    onSubmit={(meaning:WordMeaning)=>{
                        setMeanings([...meanings, meaning]);
                        setOpenEditModal(false);
                    }}
                    onCancel={()=>{
                        setMeaningToEdit(undefined);
                        setOpenEditModal(false);
                    }}
                />
            }
        </div>
    )
}

export default SearchPage;