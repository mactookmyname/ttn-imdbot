# ttn-imdbot
A bot which runs on thetreesnetwork to display information from imdb.

Main Bot code lifted from [treesnetwork-bot](https://github.com/simonify/treesnetwork-bot).

## Dependencies
* [imgur](https://github.com/kaimallea/node-imgur) - for uploading poster to imgur which is a friendlier host for chat

## TODO
* Handle titles with multiple imdb results e.g. _Halloween_
* Add support for writer, actor, directors, etc
* If we don't find a description with one search (movie, series) try the other, e.g. _American Ninja Warrior_
* Feature, !cops - Last time COPS was played
* Drugs command outputs undefined when nothing found, should prob be an error, didn't get data for _Signs_, _Shallow Hal_
