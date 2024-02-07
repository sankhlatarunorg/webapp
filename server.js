const express = require('express');
const bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());


app.use('/', (req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    next();
});
app.use('/', (req, res) => {
    res.status(404).send();
});


app.listen(3000, function () {
    console.log('Health Check Application listening on port 3000!');
});
