const express = require('express');
const bodyParser = require('body-parser');
const { checkIfPayloadIsEmpty } = require('./service');
require('dotenv').config();
const User = require('./Model').users;



const database = require('./Model');
var app = express();
app.use(bodyParser.json());


app.use('/', (req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    next();
});

app.use('/healthz', (req, res, next) => {
    if (req.method !== 'GET') {
        res.status(405).send();
    }
    next();
});

app.get('/healthz', async function (req, res) {
    checkIfPayloadIsEmpty(req, res);
    (async () => {
        try {
            await database.sequelize.authenticate();
            (async () => {
                await User.sync({ force: true });
                // Table created
                const users = await User.findAll();
                console.log(users);

            })();
            console.log('Connection has been established successfully.');
            res.status(200).send();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            res.status(503).send();
        }
    })();
});

app.use('/', (req, res) => {
    res.status(404).send();
});


app.listen(3000, function () {
    console.log('Health Check Application listening on port 3000!');
});
