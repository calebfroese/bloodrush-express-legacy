var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
    if (err) throw err
    database = db;
})
var database;

// Query scripts
var collections = {
    'teams': require('./teams.js')
}

module.exports = {
    query: (collection, queryname, callback) => {
        collections[collection][queryname](database, response => {
            callback(response)
        });
    }
}