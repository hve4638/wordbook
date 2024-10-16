import { useEffect, useState } from 'react';
import { useContextForce, EventContext } from 'contexts';
import LocalAPI from 'api/local';

import GoogleFontIconButton from 'components/GoogleFontIconButton';
import SearchPage from 'pages/SearchPage';

const BookmarkOrder = {
    LATEST: '추가 순',
    INCORRECT: '오답률 순',
} as const;
type BookmarkOrder = typeof BookmarkOrder[keyof typeof BookmarkOrder];

function BookmarkPage() {
    const eventContext = useContextForce(EventContext);
    const [bookmarkList, setBookmarkList] = useState<WordData[]>([]);
    const [unbookmarked, setUnbookmarked] = useState<{[word:string]:true}>({});
    const [bookmarkOrder, setBookmarkOrder] = useState<BookmarkOrder>(BookmarkOrder.LATEST);

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
        let promise:Promise<WordData[]>;
        if (bookmarkOrder === BookmarkOrder.LATEST) {
            promise = LocalAPI.getWords([{ latest: true }])
        }
        else if (bookmarkOrder === BookmarkOrder.INCORRECT) {
            promise = LocalAPI.getWords([{ highQuizIncorrect: true }])
        }
        else {
            return;
        }

        promise
            .then(result => {
                setBookmarkList(result);
            })
            .catch(err => {
                console.error(err);
                setBookmarkList([]); 
            });
    }, [bookmarkOrder]);
    
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
                <div
                    className='app-nodrag'
                    style={{margin:'8px'}}
                >
                    <select
                        onChange={(e)=>{
                            setBookmarkOrder(e.target.value as BookmarkOrder);
                        }}
                    >
                        {
                            Object.values(BookmarkOrder).map((order, index) => {
                                return (
                                    <option key={index}>{order}</option>
                                );
                            })
                        }
                    </select>
                </div>
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
                            <span
                                className={
                                    `word score undraggable`
                                }
                                style={{
                                    marginRight: '8px',
                                }}
                            >
                                {`${wordData.correct} / ${wordData.incorrect}`}
                            </span>
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