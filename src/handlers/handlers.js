import broadcastDrugs from './broadcastDrugs';
import broadcastTrivia from './broadcastTrivia';
import whisperImdb from './sendImdb';
import whisperActors from './whisperActors';
import whisperDirector from './whisperDirector';
import whisperWriter from './whisperWriter';

/**
 * All handlers are sent three parameters:
 *  - bot
 *  - state
 *  - user
 **/

export default [
  { match: '!imdb', handler: whisperImdb },
  { match: '!drugs', handler: broadcastDrugs },
  { match: '!trivia', handler: broadcastTrivia },
  { match: '!actors', handler: whisperActors },
  { match: '!writer', handler: whisperWriter },
  { match: '!director', handler: whisperDirector },
];
