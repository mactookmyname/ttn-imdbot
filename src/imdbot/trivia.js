const Xray = require('x-ray');

const x = new Xray();

function getTrivia(url, cb) {
  x(url, ['#trivia_content .sodatext'])((err, data) => {
    cb(err, data.map(d => d.trim()));
  });
}

module.exports = getTrivia;
