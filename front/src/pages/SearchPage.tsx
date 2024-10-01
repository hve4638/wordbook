import { useEffect, useState } from 'react';
import { useContextForce, EventContext } from 'contexts';
import LocalAPI from 'api/local'
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import { WordData } from 'types/words';

interface SearchPageProps {
    wordData: WordData;
}

function SearchPage({wordData}:SearchPageProps) {
    const eventContext = useContextForce(EventContext);
    const [previousBookmarkAdded, setPreviousBookmarkAdded] = useState(false);
    const [bookmarkAdded, setBookmarkAdded] = useState(false);

    const backToHome = () => {
        if (previousBookmarkAdded !== bookmarkAdded) {
            if (bookmarkAdded) {
                LocalAPI.addWord(wordData);
            }
            else {
                LocalAPI.removeWord(wordData.word);
            }
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

    useEffect(() => {
        LocalAPI
            .getWord(wordData.word)
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
            <div className='column scrollbar meaning' style={{ overflowY: 'auto' }}>
            {
                wordData.data.map((result, index) => {
                    return (
                        <div
                            key={index}
                            className='app-nodrag'
                            style={{ margin: '0px 16px', paddingLeft: '8px' }}
                        >
                            <span>
                                {index + 1}. {result.to} [{result.fromType}]
                            </span>
                        </div>
                    )
                })
            }
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