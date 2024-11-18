import { useEffect, useState } from 'react';
import { useContextForce, EventContext } from 'contexts';
import LocalAPI from 'api/local'
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import NaverDictIcon from 'assets/icons/naver-dict.svg';
import GoogleFontIcon from 'components/GoogleFontIcon';

interface SearchPageProps {
    wordData: WordData;
}

function SearchPage({wordData}:SearchPageProps) {
    const eventContext = useContextForce(EventContext);
    const [previousBookmarkAdded, setPreviousBookmarkAdded] = useState(false);
    const [bookmarkAdded, setBookmarkAdded] = useState(false);
    const [meaningIndexes, setMeaningIndexes] = useState<number[]>([]);

    const word = wordData.word.trim();

    const backToHome = () => {
        if (previousBookmarkAdded !== bookmarkAdded) {
            if (bookmarkAdded) {
                LocalAPI.addWord(wordData);
            }
            else {
                LocalAPI.removeWord(wordData.word);
            }
        }

        LocalAPI.updateWordMeaningPriority(wordData.word, meaningIndexes);
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

    console.log(meaningIndexes);

    const toggleMeaningPriority = (meaningIndex:number) => {
        setMeaningIndexes((prev)=>{
            if (prev.includes(meaningIndex)) {
                return prev.filter((item)=>item !== meaningIndex);
            }
            else {
                return [...prev, meaningIndex];
            }
        });
    }

    useEffect(() => {
        // 북마크 여부 확인
        LocalAPI
            .getWord(wordData.word)
            .then(result => {
                if (result) {
                    setBookmarkAdded(true);
                    setPreviousBookmarkAdded(true);
                    setMeaningIndexes(result.priority_meaning_indexes);
                }
                else {
                    setBookmarkAdded(false);
                    setPreviousBookmarkAdded(false);
                    setMeaningIndexes([]);
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
            <div className='column scrollbar meaning-container' style={{ overflowY: 'auto' }}>
            {
                wordData.data.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className='app-nodrag row undraggable'
                            style={{ margin: '0px 16px', paddingLeft: '8px' }}
                        >
                            <span
                                className={
                                    'meaning' + (meaningIndexes.includes(index) ? ' priority' : '')
                                }
                                onClick={()=>toggleMeaningPriority(index)}
                            >
                                {index + 1}. {item.to} [{item.fromType}]
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
                <div style={{minHeight:'2em'}}/>
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
        </div>
    )
}

export default SearchPage;