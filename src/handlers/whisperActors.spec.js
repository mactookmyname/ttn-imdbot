import assert from 'assert';

import whisperActors from './whisperActors';

describe('handlers/whisperActors', () => {
  it('should whisper appropriate message when we have actors data', () => {
    const Actors = 'Kevin Bacon, Justin Long';
    const message = `#undefined :couple: Featured Actor(s): ${Actors}`;
    const state = { imdb: { Actors } };
    return whisperActors({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail when actors return from omdb as "N/A"', () => {
    const message = '#undefined :no_entry_sign: No Actor information found. :disappointed:';
    const state = { imdb: { Actors: 'N/A' } };
    return whisperActors({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail gracefully', () => {
    const message = '#undefined :no_entry_sign: No Actor information found. :disappointed:';
    return whisperActors()[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });
});
