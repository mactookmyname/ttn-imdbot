import assert from 'assert';

import sendMessages from './sendMessages';
import { lipsum, lipsum2 } from './splitMessages.spec';

describe('sendMessages', () => {
  it('should whisper when target is sent', () => {
    const message = 'Foo';
    const target = 'Username';
    const result = sendMessages({}, [message], target);

    return result[0].then((d) => {
      assert.deepEqual(d, {
        message,
        target,
      });
    });
  });

  it('should handle a single incoming string for message', () => {
    const message = 'Foo';
    const result = sendMessages({}, message);

    return result[0].then((d) => {
      assert.deepEqual(d, {
        message: `#undefined ${message}`,
      });
    });
  });

  it('should split up long messages into smaller pieces', () => {
    const message = `${lipsum}${lipsum2}`;
    const target = 'user';
    const result = sendMessages({}, [message], target);

    return Promise.all(result).then(d => {
      assert.deepEqual(d[0], {
        target,
        message: lipsum,
      });
      assert.deepEqual(d[1], {
        target,
        message: lipsum2,
      });
    });
  });

  it('should gracefully fail', () => {
    assert.deepEqual(sendMessages(), []);
    assert.deepEqual(sendMessages(null, null, null), []);
    assert.deepEqual(sendMessages(undefined, undefined, undefined), []);
    assert.deepEqual(sendMessages('', [''], ''), []);
  });
});
