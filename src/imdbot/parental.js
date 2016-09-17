const Xray = require('x-ray');

const x = new Xray();

function getParentalGuide(url, cb) {
  x(url, {
    drugs: 'p[id="swiki.2.4.1"]',
  })((err, data) => {
    const parental = /(\d+\/10)\)?(.*)/g.exec(data.drugs);
    cb(err, {
      rating: parental[1],
      summary: parental[2].replace(/\.(\S)/g, '. $1'),
    });
  });
}

module.exports = getParentalGuide;
