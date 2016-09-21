// Trees only supports messages less than 250 characters so we split long descriptions
export default (message) => {
  if (!message) {
    return [];
  }
  const re = /.{1,240}(?!\S)/g; // This regex grabs whole words up to 240 chars
  const messages = [];
  let result;
  while ((result = re.exec(message)) !== null) { // eslint-disable-line
    messages.push(result[0]);
  }
  return messages;
};
