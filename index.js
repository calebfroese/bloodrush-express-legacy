var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var season = require('./season/season.js');
var mongo = require('./mongo/mongo.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/query/:collection/:queryname', (req, res) => {
    mongo.query(req.params.collection, req.params.queryname, req.body, (response) => {
        res.send(response)
    });
});

app.get('/genseason', (req, res) => {
    season.generateSeason(response => {
        res.send(response)
    });
});

app.listen(3000, () => {
    console.log('Bloodrush server listening on port 3000');
});
