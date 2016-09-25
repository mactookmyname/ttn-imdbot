import assert from 'assert';

import splitMessages from './splitMessages';

export const lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lectus ex. Phasellus elementum vitae velit sed congue. Morbi egestas ut arcu id ultricies. Proin egestas lacus ut tincidunt ornare. Suspendisse eget quam purus. Mauris';
export const lipsum2 = ' vestibulum efficitur arcu, in venenatis urna malesuada non. Nulla facilisi. Aliquam vitae ornare enim. Suspendisse potenti. Ut nec mauris velit. Sed pellentesque sed.';

describe('splitMessages', () => {
  it('should split a long block of text into < 250 char blocks', () => {
    assert.deepEqual(splitMessages(`${lipsum}${lipsum2}`), [lipsum, lipsum2]);
  });

  it('should gracefully fail', () => {
    assert.deepEqual(splitMessages(), []);
    assert.deepEqual(splitMessages(null), []);
    assert.deepEqual(splitMessages(undefined), []);
    assert.deepEqual(splitMessages(''), []);
  });
});
