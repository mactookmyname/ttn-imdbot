import assert from 'assert';

import whisperWriter from './whisperWriter';

describe('handlers/whisperWriter', () => {
  it('should whisper appropriate message when we have director data', () => {
    const Writer = 'Kevin Bacon, Justin Long';
    const message = `#undefined :speech_balloon: Writer(s): ${Writer}`;
    const state = { imdb: { Writer } };
    return whisperWriter({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail when director return from omdb as "N/A"', () => {
    const message = '#undefined :no_entry_sign: No Writer information found. :disappointed:';
    const state = { imdb: { Writer: 'N/A' } };
    return whisperWriter({}, state)[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });

  it('should fail gracefully', () => {
    const message = '#undefined :no_entry_sign: No Writer information found. :disappointed:';
    return whisperWriter()[0].then(d => {
      assert.deepEqual(d, { message });
    });
  });
});
