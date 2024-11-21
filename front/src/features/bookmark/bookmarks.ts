import LocalAPI from 'api/local';

class Bookmarks {
    getLatest(limit=1000) {
        LocalAPI.getBookmarks(
            [
                { latest: true, limit }
            ],
            { order: 'sequence' }
        );
    }
}

export default Bookmarks;