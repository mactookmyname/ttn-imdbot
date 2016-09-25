import Xray from 'x-ray';
import _ from 'lodash';

const x = new Xray();

export const parseParentalHtml = html => {
  if (!html) { return {}; }
  const result = /(\d+\/10)?\)?(.+)/g.exec(html);

  return _.pickBy({
    rating: result[1],
    summary: result[2].replace(/\.(\S)/g, '. $1').replace(/([a-z])([A-Z])/g, '$1. $2').trim(),
  }, _.identity);
};

export const getParentalGuide = (imdbID) => {
  const url = `http://www.imdb.com/title/${imdbID}/parentalguide`;
  return new Promise((resolve) => {
    x(url, {
      drugs: 'p[id="swiki.2.4.1"]@text',
    })((err, data) => {
      if (err) { return resolve(null); }
      return resolve(parseParentalHtml(_.get(data, 'drugs')));
    });
  });
};

export const getTrivia = (imdbID) => {
  const url = `http://www.imdb.com/title/${imdbID}/trivia`;
  return new Promise((resolve) => {
    x(url, ['#trivia_content .sodatext'])((err, data) => {
      if (err) { return resolve([]); }
      return resolve(data.map((d) => d.trim()));
    });
  });
};
