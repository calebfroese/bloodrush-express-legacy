var express = require('express');
var app = express();
var mongo = require('./mongo/mongo.js');

app.get('/query/:collection/:queryname', function (req, res) {
    mongo.query(req.params.collection, req.params.queryname, (response) => {
        res.send(response)
    });
})

app.listen(3000, function () {
    console.log('Bloodrush server listening on port 3000');
})