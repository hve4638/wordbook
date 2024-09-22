import {WordReference} from './services/dict';

const wordReference = new WordReference()
wordReference.search('heart').then((data) => {
    console.log(data);
});