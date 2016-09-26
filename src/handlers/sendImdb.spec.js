import assert from 'assert';

import whisperImdb, { getHeader, postToChannel } from './sendImdb';

describe('handlers/sendImdb', () => {
  describe('getHeader', () => {
    const Title = 'Joy of Painting';
    const Year = '1980';
    const rating = 5;
    const imdbID = 'foo';

    it('should return a now playing msg with a movie title', () => {
      const imdb = { Title };
      const expected = `:movie_camera: Now Playing: ${Title}`;
      assert.equal(getHeader(imdb), expected);
    });

    it('should return a now playing msg with a movie title and year', () => {
      const imdb = { Title, Year };
      const expected = `:movie_camera: Now Playing: ${Title} - (${Year})`;
      assert.equal(getHeader(imdb), expected);
    });

    it('should return a now playing msg with a movie title, year, and rating', () => {
      const imdb = { Title, Year, rating };
      const expected = `:movie_camera: Now Playing: ${Title} - (${Year}) - ${rating}/10`;
      assert.equal(getHeader(imdb), expected);
    });

    it('should return a now playing msg with a movie title, year, rating, and link', () => {
      const imdb = { Title, Year, rating, imdbID };
      const expected = `:movie_camera: Now Playing: ${Title} - (${Year}) - ${rating}/10 - http://www.imdb.com/title/${imdbID}`;
      assert.equal(getHeader(imdb), expected);
    });

    it('should fail gracefully', () => {
      assert.equal(getHeader(), 'IMDB information currently unavailable.');
    });
  });

  describe('postToChannel', () => {
    it('should provide available commands to the channel', () => {
      const commands = ['!drugs', '!actors'];
      const state = { commands };
      const message = `#undefined :point_right: Additional commands available in this channel: ${commands.join(' | ')}`;
      return Promise.all(postToChannel({}, state)).then(d => {
        assert.deepEqual(d[d.length - 1], { message });
      });
    });

    it('should fail gracefully', () => {
      const message = '#undefined IMDB information currently unavailable.';
      return postToChannel()[0].then(d => {
        assert.deepEqual(d, { message });
      });
    });
  });

  describe('whisperImdb', () => {
    it('should fail gracefully', () => {
      const message = '#undefined IMDB information currently unavailable.';
      return whisperImdb()[0].then(d => {
        assert.deepEqual(d, { message });
      });
    });
  });
});
