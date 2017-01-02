var ObjectId = require('mongodb').ObjectID;

module.exports = {
    all: (database, params, callback) => {
        database.collection('users').find().toArray((err, result) => {
            if (err) throw err
            callback(result);
        })
    },
    create: (database, params, callback) => {
        if (params.username && params.email && params.password) {
            database.collection('users').insert({
                username: params.username,
                email: params.email,
                password: params.password
            });
            callback({ 'ok': true });
        } else {
            callback({ 'error': 'missing params' });
        }

    },
    delete: (database, params, callback) => {
        if (params.id) {
            console.log('Deleting with id of ' + params.id);
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
                if (result[0].password === params.password) {
                    // Successful login
                    callback({ 'loggedIn': true });
                } else {
                    callback({ 'error': 'invalid password' });
                }
            });
        } else {
            callback({ 'error': 'missing params' });
        }
    }
}
