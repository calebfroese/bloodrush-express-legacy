var ObjectId = require('mongodb').ObjectID;

module.exports = {
    all: (database, params, callback) => {
        database.collection('teams').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    byId: (database, params, callback) => {
        database.collection('teams').find({ '_id': ObjectId(params.id) }).toArray((err, result) => {
            if (err) throw err
            callback(result[0]);
        })
    },
    byOwner: (database, params, callback) => {
        database.collection('teams').find({ 'owner': ObjectId(params.ownerId) }).toArray((err, result) => {
            if (err) throw err
            callback(result[0]);
        })
    }
}
