var mongo = require('./../mongo/mongo.js');
var endpointTeams = require('./teams.endpoint.js');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    all: (db, params, callback) => {
        // Returns all seasons in an array
        db.collection('seasons').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    allActive: (db, params, callback) => {
        // Returns all active seasons in an array
        db.collection('seasons').find({ active: true }).toArray((err, activeSeason) => {
            if (err) throw err
            callback(activeSeason);
        })
    },
}
