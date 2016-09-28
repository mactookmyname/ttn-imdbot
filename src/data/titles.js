import _ from 'lodash';

const mappings = {
  'The Whitest Kids U\' Know': 'The Whitest Kids U\'Know',
  MXC: 'Most Extreme Elimination Challenge',
};

const getTitle = title => _.get(mappings, title, title || '');

export default getTitle;
