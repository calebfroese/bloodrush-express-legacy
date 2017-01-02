var robin = require('roundrobin');
var MongoClient = require('mongodb').MongoClient;
var database;
MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
    if (err) throw err
    database = db;
})

module.exports = {
    generateSeason: (callback) => {
        // Generates a season with the currently enlisted teams
        if (database) {
            database.collection('teams').find().toArray((err, teamsArray) => {
                if (err) throw err
                // Now we have an array of the teams in teamsArray
                // Generate 25 rounds
                if (teamsArray < 3) {
                    callback('must have at least 3 players');
                    return;
                }

                var playersArray = [];
                for(var i = 1; i <= 8; i++) {
                    playersArray.push('Player ' + i);
                }
                // teamsArray.forEach(function (team) {
                //     playersArray.push(team.name);
                // }, this);

                var playerCount = playersArray.length;
                
                // if (playerCount % 2 === 1) {
                //     playersArray.push('Bye'); // so we can match algorithm for even numbers
                //     playerCount += 1;
                // }

                var games = [];
                for(var i = 0; i < playerCount - 1; i++) {
                    games[i] = [];
                    for(var j = 0; j < playerCount / 2; j++) {
                        games[i].push([playersArray[j], playersArray[playerCount - j - 1]]);
                    }
                    console.log(`${playersArray[0]} ${playersArray[1]} ${playersArray[2]} ${playersArray[3]}`);
                    console.log(`${playersArray[7]} ${playersArray[6]} ${playersArray[5]} ${playersArray[4]}`);
                    console.log('--');

                    // Move the arrays
                    var first = playersArray[0];
                    var last = playersArray[playerCount - 1];

                    playersArray.splice(-1, 1);
                    playersArray.splice(0, 1);
                    playersArray.unshift(last);
                    playersArray.unshift(first);
                }
                console.log(games);
                callback(games);
            })
        } else {
            callback('no database!');
        }
    }
}