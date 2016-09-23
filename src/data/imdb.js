const Xray = require('x-ray');

const x = new Xray();

export const getParentalGuide = (imdbID) => {
  const url = `http://www.imdb.com/title/${imdbID}/parentalguide`;
  return new Promise((resolve) => {
    x(url, {
      drugs: 'p[id="swiki.2.4.1"]@text',
    })((err, data) => {
      if (err) { return resolve(null); }

      const parental = /(\d+\/10)?\)?(.+)/g.exec(data.drugs);
      return resolve({
        rating: parental[1],
        summary: parental[2].replace(/\.(\S)/g, '. $1').replace(/([a-z])([A-Z])/g, '$1. $2'),
      });
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
