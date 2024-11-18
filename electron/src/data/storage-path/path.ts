import * as path from 'path';

const documentsPath = path.join(process.env['USERPROFILE'] ?? '', 'Documents');
const baseDirectoryPath = path.join(documentsPath, 'Wordbook');

export {
    baseDirectoryPath,
}