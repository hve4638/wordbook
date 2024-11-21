import LocalAPI from 'api/local';
import Quiz from './quiz';

export class QuizGenerator {
    async generate(amount:number):Promise<Quiz[]> {
        const bookmarks = await LocalAPI.getBookmarks(
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

        const onCorrectAnswer = (correct) => {
            LocalAPI.increaseBookmarkQuizScore(correct.word, 1, 0);
        }
        const onIncorrectAnswer = (correct, incorrect) => {
            LocalAPI.increaseBookmarkQuizScore(correct.word, 0, 1);
        }

        return bookmarks.map(
            (bookmarkData) => new Quiz(
                bookmarkData,
                bookmarks,
                {
                    onCorrectAnswer,
                    onIncorrectAnswer,
                }
            )
        );
    }
}