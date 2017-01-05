var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');


const IDEAL_TOTAL_GAMES_PLAYED = 26; // season matcher will try to get close to this value of games played (therefore days)
var nextGameDate = moment();
var roundNumber = 1;


module.exports = {
    byNumber: (database, params, callback) => {
        // Fetches the season by its number
        database.collection('seasons').find({ 'number': params['number'] }).toArray((err, items) => {
            callback(items[0]);
        });
    },
    byActive: (database, params, callback) => {
        // Fetches the active season
        console.log('finding season');
        database.collection('seasons').find({ 'active': true }).toArray((err, items) => {
            callback(items[0]);
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

                    var regularGames = [];
                    regularGames = shuffle(createRounds(teamsIdArray));
                    var gamesThisSeason = regularGames.length;

                    var over;
                    var under;
                    var use;
                    for (var i = 1; i < IDEAL_TOTAL_GAMES_PLAYED; i++) {
                        if (i * gamesThisSeason > IDEAL_TOTAL_GAMES_PLAYED) {
                            over = i;
                            break;
                        } else {
                            under = i;
                        }
                    }
                    // Should we go over the amount of games, or under, dpeending which is closer
                    if (IDEAL_TOTAL_GAMES_PLAYED - (under * gamesThisSeason) > (over * gamesThisSeason) - IDEAL_TOTAL_GAMES_PLAYED) {
                        // Use over
                        use = over;
                    } else {
                        use = under;
                    }
                    for (var i = 1; i < use; i++) {
                        regularGames = regularGames.concat(shuffle(createRounds(teamsIdArray)));
                    }
                    // Fetch the season number
                    var highestSeason = 1;
                    getHighestSeason(databaseLocalScope).then(array => {
                        array.forEach(a => {
                            // Iterate through the seasons to find the highest
                            if (a.number >= highestSeason) {
                                highestSeason = a.number + 1;
                            }
                        });
                    }).catch(err => {
                        console.log('error', err);
                        return;
                    }).then(() => {
                        databaseLocalScope.collection('seasons').update({
                            active: true
                        }, { $set: { active: false } }, { upsert: false, multi: true });
                        console.log('Updating old seasons');
                    }).then(() => {
                        // Generate playoffs
                        var playoffGames = generatePlayoffs();
                        var fullSeason = regularGames.concat(playoffGames);
                        // Add season
                        databaseLocalScope.collection('seasons').insert({
                            number: highestSeason,
                            games: fullSeason,
                            active: true
                        });
                    });
                })
            }
        });
    }
}

function createRounds(playersArray) {
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
            gamesArray.push({
                'home': playersArray[j],
                'away': playersArray[playerCount - j - 1],
                'date': moment(nextGameDate).toDate(),
                'round': roundNumber,
                'game': {}
            });
        }
        // Move the arrays
        var first = playersArray[0];
        var last = playersArray[playerCount - 1];

        playersArray.splice(-1, 1);
        playersArray.splice(0, 1);
        playersArray.unshift(last);
        playersArray.unshift(first);

        roundNumber++;
        nextGameDate = moment(nextGameDate).add(1, 'day');
    }

    return gamesArray;
}

function shuffle(array) {
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

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getHighestSeason(db) {
    var database = db;
    return new Promise((resolve, reject) => {
        database.collection('seasons').find().toArray((err, array) => {
            if (err) reject(err)
            resolve(array);
        });
    });
}

function generatePlayoffs() {
    var gamesArray = [];

    // Semi
    for (var i = 0; i < 4; i++) {
        var positions = [[1, 8], [4, 5], [3, 6], [2, 7]];
        gamesArray.push({
            'home': { 'name': positions[i][0] },
            'away': { 'name': positions[i][1] },
            'date': moment(nextGameDate).toDate(),
            'round': ('semi' + i),
            'game': {}
        });
    }
    // Finals
    for (var i = 0; i < 2; i++) {
        var positions = [['semi0', 'semi1'], ['semi2', 'semi3']];
        gamesArray.push({
            'home': { 'name': positions[i][0] },
            'away': { 'name': positions[i][1] },
            'date': moment(nextGameDate).toDate(),
            'round': ('final' + i),
            'game': {}
        });
    }
    nextGameDate = moment(nextGameDate).add(1, 'day');
    // Grand final
    gamesArray.push({
        'home': { 'name': 'final0' },
        'away': { 'name': 'final1' },
        'date': moment(nextGameDate).toDate(),
        'round': ('grand'),
        'game': {}
    });
    return gamesArray;
}