var MongoClient = require('mongodb').MongoClient;
var database;
MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
    if (err) throw err
    database = db;
})

// Query scripts
var collections = {
    'teams': require('./teams.js'),
    'users': require('./users.js'),
    'seasons': require('../season/season.js')
}

module.exports = {
    query: (collection, queryname, params, callback) => {
        if (database) {
            collections[collection][queryname](database, params, response => {
                callback(response);
            });
        } else {
            callback({'error': 'no database available'});
        }
    }
}