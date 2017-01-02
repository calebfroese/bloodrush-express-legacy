var ObjectId = require('mongodb').ObjectID;
var credential = require('credential');
var pw = credential();

module.exports = {
    all: (database, params, callback) => {
        database.collection('users').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    signup: (database, params, callback) => {
        if (!params.user || !params.team) {
            callback({ 'error': 'missing team or user param' });
            return;
        }
        pw.hash(params.user.password, (err, hash) => {
            if (err) { throw err; }
            // Create in users
            database.collection('users').insert({
                username: params.user.username,
                email: params.user.email,
                password: hash
            });
            database.collection('teams').insert({
                name: params.team.name,
                acronym: params.team.acronym,
                style: params.team.style,
                col1: params.team.col1,
                col2: params.team.col2,
                col3: params.team.col3
            });
            callback({ 'ok': true });
        });
    },
    delete: (database, params, callback) => {
        if (params.id) {
            database.collection('users').remove({ '_id': ObjectId(params.id) }, { justOne: false })
            callback({ 'ok': true });
        } else {
            callback({ 'error': 'missing params' });
        }
    },
    login: (database, params, callback) => {
        if (params.username && params.password) {
            // Make sure that the user exists
            database.collection('users').find({
                username: params.username
            }).toArray((err, result) => {
                if (!result || result.length === 0) {
                    callback({ 'error': 'could not find user with those credentials' });
                    return;
                }
                if (result.length !== 1) {
                    callback({ 'error': 'invalid user amount' });
                    console.error('Attempted to log in, found ' + results.length + ' users called ' + params.username);
                    return;
                }
                // Check password
                pw.verify(result[0].password, params.password, (err, isValid) => {
                    if (err) { throw err; }
                    if (isValid) {
                        callback({ 'ok': true });
                    } else {
                        callback({ 'error': 'passwords do not match' });
                    }
                });
            });
        } else {
            callback({ 'error': 'missing params' });
        }
    }
}
