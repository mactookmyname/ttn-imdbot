import assert from 'assert';

import { parseParentalHtml } from './imdb';

describe('data/imdb', () => {
  // TODO: workaholics error where it picks up the "Alcohol/Drugs/Smoking" part of the rating
  describe('parseParentalHtml', () => {
    it('should return a summary', () => {
      const summary = 'foobar';
      assert.deepEqual(parseParentalHtml(summary), {
        summary,
      });
    });

    it('should split apart sentences properly', () => {
      const firstSentence = 'First sentence.';
      const secondSentence = 'Next sentence.';
      assert.deepEqual(parseParentalHtml(`${firstSentence}${secondSentence}`), {
        summary: `${firstSentence} ${secondSentence}`,
      });
    });

    it('should split apart sentences properly when missing period', () => {
      const firstSentence = 'First sentence';
      const secondSentence = 'Next sentence';
      assert.deepEqual(parseParentalHtml(`${firstSentence}${secondSentence}`), {
        summary: `${firstSentence}. ${secondSentence}`,
      });
    });

    it('should return a summary and rating if available', () => {
      const rating = '5/10';
      const summary = 'foobar';
      assert.deepEqual(parseParentalHtml(`${rating} ${summary}`), {
        rating,
        summary,
      });
    });

    it('should gracefully fail', () => {
      assert.deepEqual(parseParentalHtml(), {});
      assert.deepEqual(parseParentalHtml(undefined), {});
      assert.deepEqual(parseParentalHtml(null), {});
      assert.deepEqual(parseParentalHtml(''), {});
    });
  });
});
