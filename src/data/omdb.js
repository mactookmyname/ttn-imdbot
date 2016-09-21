import request from 'request-promise';
import options from '../config.json';
import stripYear from '../utils/stripYear';

export default (video) => {
  // Removes trailing year names on title which causes api lookup to fail
  const name = stripYear(video.name);

  // Searches specifically for series instead of movie for shorter durations
  const type = video.duration < options.seriesDuration ? 'series' : 'movie';

  const omdbOptions = {
    uri: 'http://www.omdbapi.com/?',
    json: true,
    qs: {
      type,
      t: name,
      plot: 'short',
      r: 'json',
    },
  };

  return request(omdbOptions);
};
