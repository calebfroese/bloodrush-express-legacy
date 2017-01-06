var mongo = require('./../mongo/mongo.js');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    /**
     * Fetches all users
     */
    all: (database, params, callback) => {
        database.collection('users').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    /**
     * Fetches a user by their id
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
    /**
     * Deletes a user (not a team)
     * @param {string} _id
     */
    allDelete: (database, params, callback) => {
        if (params.id) {
            database.collection('users').remove({ '_id': ObjectId(params._id) }, { justOne: false })
            callback({ 'ok': true });
        } else {
            callback({ 'error': 'missing params' });
        }
    },
}