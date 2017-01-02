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

                
                const DUMMY = -1;
                var playersArray = [];
                teamsArray.forEach(function (team) {
                    playersArray.push(team.name);
                }, this);
                var playerCount = playersArray.length;
                var roundRobinArray = [];                  // rs = round array
                if (!playersArray) {
                    playersArray = [];
                    for (var x = 1; x <= playerCount; x += 1) {
                        playersArray.push(x);
                    }
                } else {
                    playersArray = playersArray.slice();
                }

                if (playerCount % 2 === 1) {
                    playersArray.push(DUMMY); // so we can match algorithm for even numbers
                    playerCount += 1;
                }
                for (var j = 0; j < playerCount - 1; j += 1) {
                    roundRobinArray[j] = []; // create inner match array for round j
                    for (var i = 0; i < playerCount / 2; i += 1) {
                        if (playersArray[i] !== DUMMY && playersArray[playerCount - 1 - i] !== DUMMY) {
                            roundRobinArray[j].push([playersArray[i], playersArray[playerCount - 1 - i]]); // insert pair as a match
                        }
                    }
                    playersArray.splice(1, 0, playersArray.pop()); // permutate for next round
                }
                callback(roundRobinArray);


                // var teamIdArray = [];
                // teamsArray.forEach(function (team) {
                //     teamIdArray.push(team.name);
                // }, this);
                // var players = teamIdArray;
                // var ar = robin(players.length, players);

                // console.log(ar);
                // callback(ar);
            })
        } else {
            callback('no database!');
        }
    }
}