var mongo = require('./../mongo/mongo.js');
var endpointTeams = require('./teams.endpoint.js');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    /**
     * Fetches all seasons
     */
    all: (db, params, callback) => {
        // Returns all seasons in an array
        db.collection('seasons').find().toArray((err, allSeasons) => {
            if (err) throw err
            callback(allSeasons);
        })
    },
    /**
     * Fetches all active seasons
     */
    allActive: (db, params, callback) => {
        // Returns all active seasons in an array
        db.collection('seasons').find({ active: true }).toArray((err, activeSeasons) => {
            if (err) throw err
            callback(activeSeasons);
        })
    },
    /**
     * Finds and returns the season by its number
     * @param {string} number
     */
    oneByNumber: (db, params, callback) => {
        db.collection('seasons').find({ number: params.number }).toArray((err, seasons) => {
            if (err) throw err
            callback(seasons[0]);
        })
    },
}
