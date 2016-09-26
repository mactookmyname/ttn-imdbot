import assert from 'assert';

import whisperDirector from './whisperDirector';

describe('handlers/whisperDirector', () => {
  it('should whisper appropriate message when we have director data', () => {
    const Director = 'Kevin Bacon, Justin Long';
    const message = `#undefined :sunglasses: Director(s): ${Director}`;
    const state = { imdb: { Director } };
    return whisperDirector({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail when director return from omdb as "N/A"', () => {
    const message = '#undefined :no_entry_sign: No Director information found. :disappointed:';
    const state = { imdb: { Director: 'N/A' } };
    return whisperDirector({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail gracefully', () => {
    const message = '#undefined :no_entry_sign: No Director information found. :disappointed:';
    return whisperDirector()[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });
});
