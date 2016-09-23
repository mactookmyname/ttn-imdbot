// Filters out videos with these titles from IMDB checks
export const BLACKLIST = [
  'The Trees Network',
  'Off the Air',
];

// Minimum duration of video for us to check IMDB, prevents looking up short youtube clips
export const MINIMUM_DURATION = 1200;

// If duration is less than this we begin search for it as 'series' rather than 'movie' via omdb api
export const SERIES_DURATION = 3600;

// How long to wait since last trivia broadcast to auto-broadcast another
export const TRIVIA_AUTO_DURATION = 900000;

// How often to check for auto-broadcast timeout
export const TRIVIA_AUTO_INTERVAL = 30000;

// Minimum amount of trivia required to auto-send it,
// prevents spam for common shows w/ just a few pieces
export const TRIVIA_AUTO_REQUIRED_MINIMUM = 8;
