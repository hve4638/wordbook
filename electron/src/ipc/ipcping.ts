const ping = {
    ECHO_SYNC : 'echo-sync',
    OPEN_BROWSER : 'open-browser',

    ON_VISIBLE : 'on-visible',
    ON_HIDE : 'on-hide',
    ON_RECEIVE_CLIPBOARD : 'on-receive-clipboard',

    SEARCH_WORD_ENKO : 'search-word-enko',
    EDIT_WORD : 'edit-word',

    ADD_BOOKMARK : 'add-bookmark',
    GET_BOOKMARK : 'get-bookmark',
    GET_BOOKMARKS : 'get-bookmarks',
    DELETE_BOOKMARK : 'delete-bookmark',
    INCREASE_BOOKMARK_QUIZSCORE : 'increase-bookmark-quizscore',

    ADD_WORDSCORE_CORRECT : 'add-wordscore-correct',
    ADD_WORDSCORE_INCORRECT : 'add-wordscore-incorrect',
} as const;

export default ping;