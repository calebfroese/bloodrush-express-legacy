var ObjectId = require('mongodb').ObjectID;

module.exports = {
    all: (database, params, callback) => {
        database.collection('teams').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    }
}
