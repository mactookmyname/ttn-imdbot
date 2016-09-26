import assert from 'assert';

import broadcastDrugs from './broadcastDrugs';

describe('handlers/broadcastDrugs', () => {
  it('should broadcast to appropriate channel with usename, rating, and summary', () => {
    const username = 'simon';
    const user = { username };
    const rating = '1/10';
    const summary = 'not srs drugs';
    const state = { parentalGuide: {
      rating,
      summary,
    } };
    const message = `#undefined :weed: @${username} Drug & Alcohol Usage - Rating: ${rating} - ${summary}`;

    return Promise.all(broadcastDrugs({}, state, user)).then(d => {
      assert.deepEqual(d[0], { message });
    });
  });

  it('should broadcast to appropriate channel with rating, and summary', () => {
    const rating = '1/10';
    const summary = 'not srs drugs';
    const state = { parentalGuide: {
      rating,
      summary,
    } };
    const message = `#undefined :weed: Drug & Alcohol Usage - Rating: ${rating} - ${summary}`;

    return Promise.all(broadcastDrugs({}, state)).then(d => {
      assert.deepEqual(d[0], { message });
    });
  });

  it('should broadcast to appropriate channel with summary', () => {
    const summary = 'not srs drugs';
    const state = { parentalGuide: {
      summary,
    } };
    const message = `#undefined :weed: Drug & Alcohol Usage - ${summary}`;

    return Promise.all(broadcastDrugs({}, state)).then(d => {
      assert.deepEqual(d[0], { message });
    });
  });

  it('should gracefully fail', () => (
    Promise.all(broadcastDrugs()).then(d => {
      const message = '#undefined :no_entry_sign: No Drug & Alcohol usage found. :disappointed:';
      assert.deepEqual(d[0], { message });
    })
  ));
});
