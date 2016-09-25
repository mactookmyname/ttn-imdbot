import assert from 'assert';

import stripYear from './stripYear';

describe('stripYear', () => {
  it('should strip a year off the title', () => {
    const expected = 'Film Name';
    const title = `${expected} (2010)`;
    assert.equal(stripYear(title), expected);
  });

  it('should gracefully fail', () => {
    assert.equal(stripYear(), '');
    assert.equal(stripYear(null), '');
    assert.equal(stripYear(undefined), '');
  });
});
