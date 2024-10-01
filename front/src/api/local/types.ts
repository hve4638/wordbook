/**
 * getWords() 함수의 condition 매개변수의 타입
 * less 계열 속성이 more보다 우선순위가 높음.
 */
export type WordSelectCondition = {
    lessQuizFrequency?: boolean;
    moreQuizFrequency?: boolean;

    lessQuizIncorrect?: boolean;
    moreQuizIncorrect?: boolean;
}