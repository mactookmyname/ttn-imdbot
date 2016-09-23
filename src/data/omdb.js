import request from 'request-promise';
import _ from 'lodash';

import { SERIES_DURATION } from '../config';
import stripYear from '../utils/stripYear';

/**
 * Attemps to get imdb info based on the following logic:
 * 1. exact title match yields one result
 * 2. exact type (series, movie) yields one result
 * 3. whichever title has the nearest duration to the ttn metadata
 **/
const getOmdb = async (video) => {
  // Removes trailing year names on title which causes api lookup to fail
  const name = stripYear(video.name);

  // Searches specifically for series instead of movie for shorter durations
  const type = video.duration < SERIES_DURATION ? 'series' : 'movie';

  const omdbOptions = {
    uri: 'http://www.omdbapi.com/?',
    json: true,
  };

  const omdbSearch = {
    ...omdbOptions,
    qs: {
      s: name,
    },
  };

  const getById = ({ imdbID }) => request({ ...omdbOptions, qs: { i: imdbID } });
  const matchTitle = (results) => (
    _.filter(results.Search, (r) => _.eq(_.toLower(r.Title), _.toLower(name)))
  );
  const durationDiff = (runtime) => Math.abs((parseInt(runtime, 10) * 60) - video.duration);

  // search for all titles
  const searchResults = await request(omdbSearch);
  if (searchResults.Error) {
    throw new Error('Error from OMDB endpoint');
  }

  const exactTitles = matchTitle(searchResults);
  if (exactTitles.length === 0) {
    throw new Error(`No exact matches found: ['${video.name}' not found in results of [${_.map(searchResults.Search, (r) => r.Title)}]]`);
  } else if (exactTitles.length === 1) {
    return getById(_.head(exactTitles));
  }

  const exactTypes = _.filter(exactTitles, { Type: type });
  if (exactTypes.length === 1) {
    return getById(_.head(exactTypes));
  }

  const allMatches = await Promise.all(_.map(exactTypes, getById));
  return _.reduce(allMatches, (acc, val) => (
    durationDiff(acc.Runtime) < durationDiff(val.Runtime) ? acc : val
  ));
};

export default getOmdb;
