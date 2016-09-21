import broadcastDrugs from './broadcastDrugs';
import broadcastTrivia from './broadcastTrivia';
import whisperImdb from './whisperImdb';

export default [
  { match: '!testimdb', handler: whisperImdb },
  { match: '!testdrugs', handler: broadcastDrugs },
  { match: '!testtrivia', handler: broadcastTrivia },
];
