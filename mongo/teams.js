// Queries the teams
module.exports = {
    all: (database, callback) => {
        if (database) {
            database.collection('teams').find().toArray((err, result) => {
                if (err) throw err
                callback(result);
            })
        } else {
            callback('Database not connected');
            console.error('Call to unconnected db');
        }
    }
}
