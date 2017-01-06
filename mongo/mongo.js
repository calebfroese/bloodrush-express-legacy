var MongoClient = require('mongodb').MongoClient;
var database;
MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
    if (err) throw err
    database = db;
})

// Query scripts
var collections = {
    'teams': require('./../endpoints/teams.endpoint.js'),
    'users': require('./../endpoints/users.endpoint.js'),
    'seasons': require('./../endpoints/seasons.endpoints.js'),
    'accounts': require('./../endpoints/accounts/accounts.endpoint.js')
}

module.exports = {
    query: (collection, queryname, params, callback) => {
        if (database) {
            collections[collection][queryname](database, params, response => {
                callback(response);
            });
        } else {
            callback(new Error('No database available'));
        }
    }
}