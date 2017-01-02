var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');


const IDEAL_TOTAL_GAMES_PLAYED = 26; // season matcher will try to get close to this value of games played (therefore days)
var nextGameDate = moment();
var createRounds = (playersArray) => {
    // Logic from: http://stackoverflow.com/questions/6648512/scheduling-algorithm-for-a-round-robin-tournament
    // Create a round where each player will play everyone else once
    var playerCount = playersArray.length;
    // If there is an odd number, add a null (which is a bye)
    if (playerCount % 2 === 1) {
        playersArray.push(null);
        playerCount += 1;
    }

    var gamesArray = [];

    for (var i = 0; i < playerCount - 1; i++) {

        for (var j = 0; j < playerCount / 2; j++) {
            gamesArray.push([playersArray[j], playersArray[playerCount - j - 1], moment(nextGameDate).toDate()]);
            console.log(moment(nextGameDate).format('DD/MM'));
        }
        // Move the arrays
        var first = playersArray[0];
        var last = playersArray[playerCount - 1];

        playersArray.splice(-1, 1);
        playersArray.splice(0, 1);
        playersArray.unshift(last);
        playersArray.unshift(first);

        nextGameDate = moment(nextGameDate).add(1, 'day');
    }

    return gamesArray;
}

var shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

module.exports = {
    byNumber: (database, params, callback) => {
        // Fetches the season by its number
        database.collection('seasons').find().toArray((err, items) => {
            callback(items);
        });
    },
    generateSeason: (callback) => {
        MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, databaseLocalScope) => {
            if (err) throw err
            // Generates a season with the currently enlisted teams
            if (databaseLocalScope) {
                databaseLocalScope.collection('teams').find().toArray((err, teamsArray) => {
                    if (err) throw err
                    // Now we have an array of the teams in teamsArray
                    // Generate 25 rounds
                    if (teamsArray < 3) {
                        callback('must have at least 3 players');
                        return;
                    }

                    var teamsIdArray = [];

                    teamsArray.forEach(function (team) {
                        teamsIdArray.push(team._id);
                    }, this);

                    var season = [];
                    season = (createRounds(teamsIdArray));
                    var gamesPerSeason = season.length;

                    var over;
                    var under;
                    var use;
                    for (var i = 1; i < IDEAL_TOTAL_GAMES_PLAYED; i++) {
                        if (i * gamesPerSeason > IDEAL_TOTAL_GAMES_PLAYED) {
                            over = i;
                            break;
                        } else {
                            under = i;
                        }
                    }
                    // Should we go over the amount of games, or under, dpeending which is closer
                    if (IDEAL_TOTAL_GAMES_PLAYED - (under * gamesPerSeason) > (over * gamesPerSeason) - IDEAL_TOTAL_GAMES_PLAYED) {
                        // Use over
                        use = over;
                    } else {
                        use = under;
                    }

                    for (var i = 1; i < use; i++) {
                        season = season.concat((createRounds(teamsIdArray)));
                    }

                    // Save the season
                    databaseLocalScope.collection('seasons').findOne({ $query: {}, $orderby: { number: -1 } }, results => {
                        var highestSeason = 1;
                        if (results) {
                            console.log(results);
                        }
                        console.log({ number: 1, games: season });
                        databaseLocalScope.collection('seasons').insert({
                            number: highestSeason,
                            games: season
                        });
                        callback({ number: 1, games: season });
                    });
                })

            }
        });
    }
}
