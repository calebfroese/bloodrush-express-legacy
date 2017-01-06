var mongo = require('./../mongo/mongo.js');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    /**
     * Return all teams
     */
    all: (db, params, callback) => {
        // Returns all teams in an array
        db.collection('teams').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    /**
     * Fetches a team by its id
     * @param {string} _id
     */
    oneById: (db, params, callback) => {
        db.collection('teams').find({ '_id': ObjectId(params._id) }).toArray((err, team) => {
            callback(team[0])
        });
    },
    /**
     * Fetches a team by its owner
     * @param {string} ownerId
     */
    oneByOwner: (db, params, callback) => {
        db.collection('teams').find({ '_id': ObjectId(params.ownerId) }).toArray((err, team) => {
            callback(team[0])
        });
    },
}