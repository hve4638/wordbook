import { useEffect, useState } from 'react';
import { useContextForce, EventContext } from 'contexts';
import LocalAPI from 'api/local';

import GoogleFontIconButton from 'components/GoogleFontIconButton';
import { WordData } from 'types/words';
import SearchPage from 'pages/SearchPage';

function BookmarkPage() {
    const eventContext = useContextForce(EventContext);
    const [bookmarkList, setBookmarkList] = useState<WordData[]>([]);
    const [unbookmarked, setUnbookmarked] = useState<{[word:string]:true}>({});

    const toogleBookmark = async (wordData:WordData) => {
        if (unbookmarked[wordData.word]) {
            const newUnbookmarked = {...unbookmarked};
            delete newUnbookmarked[wordData.word];
            setUnbookmarked(newUnbookmarked);
        }
        else {
            const newUnbookmarked = {...unbookmarked};
            newUnbookmarked[wordData.word] = true;
            setUnbookmarked(newUnbookmarked);
        }
    }

    const isUnbookmarked = (wordData:WordData) => {
        return unbookmarked[wordData.word];
    }

    const backToHome = () => {
        for (const word in unbookmarked) {
            LocalAPI.removeWord(word);
            console.log(`[Unbookmarked] ${word}`);
        }
        eventContext.popPage();
    }

    useEffect(() => {
        LocalAPI
            .getLatestWords(0, 1000)
            .then(result => {
                setBookmarkList(result);
            })
            .catch(err => {
                console.error(err);
                setBookmarkList([]); 
            });
    }, []);
    
    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                backToHome();
            }
        }
        window.addEventListener('keydown', onKeydown);
        return () => {
            window.removeEventListener('keydown', onKeydown);
        }
    });

    return (
        <div className='column fill relative'>
        <GoogleFontIconButton
            className='app-nodrag undraggable fonticon clickable absolute'
            style={{
                top: '0px',
                right: '0px',
                margin: '4px'
            }}
            value='arrow_back'
            onClick={() => backToHome()}
        />
            <span
                className='row'
                style={{
                    alignItems: 'flex-end',
                }}
            >
                <h2 style={{margin:'8px'}}>Bookmark</h2>
                <span
                    className='sub'
                    style={{ fontSize:'0.35em', margin:'10px 0px' }}
                >
                    word: {bookmarkList.length}
                </span>
            </span>
            <div
                className='app-nodrag column scrollable scrollbar bookmark-list'
                style={{
                    padding: '8px 8px',
                }}
            >
            {
                bookmarkList.map((wordData, index) => {
                    return (
                        <div
                            key={index}
                            className='row flex contents'
                            style={{
                                padding: '4px 8px 4px 12px',
                            }}
                        >
                            <span
                                className={
                                    `word clickable`
                                    + (
                                        isUnbookmarked(wordData)
                                        ? ' removed'
                                        : ''
                                    )
                                }
                                onClick={()=>{
                                    eventContext.pushPage(
                                        <SearchPage wordData={wordData}/>
                                    );
                                }}
                            >
                                {wordData.word}
                            </span>
                            <span></span>
                            <div className='flex'/>
                            <GoogleFontIconButton
                                className={
                                    'noflex fonticon clickable'
                                    + (
                                        isUnbookmarked(wordData)
                                        ? (' unbookmarked')
                                        : ''
                                    )
                                }
                                style={{
                                    fontSize: '0.7em',
                                }}
                                value={
                                    isUnbookmarked(wordData)
                                    ? 'bookmark_add'
                                    : 'bookmark_remove'
                                }
                                onClick={()=>toogleBookmark(wordData)}
                            />
                        </div>
                    );
                })
            }
            </div>
        </div>
    );
}

export default BookmarkPage;