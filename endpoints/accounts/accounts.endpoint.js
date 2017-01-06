var ObjectId = require('mongodb').ObjectID;
var credential = require('credential');
var pw = credential();

module.exports = {
    /**
     * Signs a user up
     * @param {string} user.password
     * @param {string} user.username
     * @param {string} user.email
     * @param {string} team.name
     * @param {string} team.acronym
     * @param {string} team.style
     * @param {string} team.col1
     * @param {string} team.col2
     * @param {string} team.col3
     */
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
            }, (err) => {
                if (err) throw err;
                database.collection('users').find({
                    username: params.user.username,
                    email: params.user.email,
                    password: hash
                }).toArray((err, result) => {
                    database.collection('teams').insert({
                        name: params.team.name,
                        acronym: params.team.acronym,
                        style: params.team.style,
                        col1: params.team.col1,
                        col2: params.team.col2,
                        col3: params.team.col3,
                        owner: result[0]._id
                    });
                    callback({ 'ok': true });
                })

            });
        });
    },
    /**
     * Logs a user in
     * @param {string} username
     * @param {string} password
     */
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
