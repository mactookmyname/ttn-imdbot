# ttn-imdbot
A bot which runs on thetreesnetwork to display information from imdb.

Main Bot code lifted from [treesnetwork-bot](https://github.com/simonify/treesnetwork-bot).

## Dependencies
* [imgur](https://github.com/kaimallea/node-imgur) - for uploading poster to imgur which is a friendlier host for chat

## TODO
* Handle titles with multiple imdb results (current [imdb-api](https://github.com/worr/node-imdb-api) only returns a single response)
* Convert to use https://github.com/treesnetwork/bot as base
* Add support for writer, actor, directors, etc
* Send trivia after 15 minutes since last trivia
