import assert from 'assert';

import handlers from './handlers';
import broadcastDrugs from './broadcastDrugs';

describe('handlers/handlers', () => {
  it('should setup match handler mappings', () => {
    assert.equal(handlers.find(h => h.match === '!drugs').handler, broadcastDrugs);
  });
});
