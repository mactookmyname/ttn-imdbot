import assert from 'assert';

import getTitle from './titles';

describe('data/titles', () => {
  it('should map a known bad title into a good one', () => {
    const expected = 'Most Extreme Elimination Challenge';
    assert.equal(getTitle('MXC'), expected);
  });

  it('should return an unknown title back', () => {
    const expected = 'foo';
    assert.equal(getTitle(expected), expected);
  });

  it('should gracefully fail', () => {
    assert.equal(getTitle(), '');
  });
});
