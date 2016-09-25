// Some titles have year included but will fail omdb api lookup if included
export default (name) => (name ? name.replace(/\s\(\d{4}\)/, '') : '');
