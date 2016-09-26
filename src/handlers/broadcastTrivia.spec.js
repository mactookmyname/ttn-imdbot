import assert from 'assert';

import broadcastTrivia from './broadcastTrivia';

describe('handlers/broadcastTrivia', () => {
  it('should broadcast trivia msg, username when available', () => {
    const username = 'simon';
    const user = { username };
    const triviaText = 'Something crazy about a movie.';
    const Title = 'Movie Name (2007)';
    const state = {
      triviaIndex: 0,
      trivia: [triviaText],
      imdb: { Title },
    };
    const message = `#undefined :tada: @${username} ${Title} Trivia 1 out of ${state.trivia.length}: ${triviaText}`;
    return broadcastTrivia({}, state, user)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should broadcast trivia msg when available', () => {
    const triviaText = 'Something crazy about a movie.';
    const Title = 'Movie Name (2007)';
    const state = {
      triviaIndex: 0,
      trivia: [triviaText],
      imdb: { Title },
    };
    const message = `#undefined :tada: ${Title} Trivia 1 out of ${state.trivia.length}: ${triviaText}`;
    return broadcastTrivia({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should properly increment state trivia index', () => {
    const state = {
      triviaIndex: 0,
      trivia: ['foo', 'bar'],
    };
    return broadcastTrivia({}, state)[0].then(() => {
      assert.equal(state.triviaIndex, 1);
    });
  });

  it('should broadcast appropriate error if we have an empty trivia collection', () => {
    const message = '#undefined :no_entry_sign: No Trivia available. :disappointed:';
    return broadcastTrivia({}, { trivia: [] })[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });
});
