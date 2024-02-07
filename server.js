const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const base64 = require('base-64');
const workFactor = 8;
const bodyParser = require('body-parser');
const { checkIfPayloadIsEmpty } = require('./service');
const database = require('./Model');
const database = require('./Model');
const User = require('./Model').users;

var app = express();
app.use(bodyParser.json());

async function returnPasswordHash(password) {
    let salt = await bcrypt.genSalt(workFactor);
    return await bcrypt.hash(password, salt);
}

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send();
        }

        const credentials = base64.decode(authHeader.split(' ')[1]);
        const [username, password] = credentials.split(':');
        console.log(username, password);
        (async () => {
            const user = await User.findOne({ where: { username: username } });
            if (!user) {
                return res.status(403).json({ error: 'Invalid username'});
            }
            if (!bcrypt.compare(password, user.password)) {
                return res.status(403).json({ error: 'Invalid password' });
            }
    
            req.user = user;
            next();
        })();
       
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
}




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

app.use('/v1/user/self', (req, res, next) => {
    if (['GET', 'PUT', 'POST'].indexOf(req.method) === -1){
        res.status(405).send();
    }
    next();
});


app.get('/v1/user/self', authenticate, (req, res) => {
    res.status(200).json({
        "id": req.user.id,
        "first_name": req.user.first_name,
        "last_name": req.user.last_name,
        "username": req.user.username,
        "account_created": req.user.account_created,
        "account_updated": req.user.account_updated
    })
});

app.put('/v1/user/self', authenticate, async (req, res, next) => {
    try {
        if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
            res.status(400).send();
        }
        const passwordHash = await returnPasswordHash(req.body.password);

        await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: passwordHash,
            username: req.body.username,
            account_updated: new Date()
        }, {
            where: {
                id: req.user.id
            }
        });
        res.status(200).send();
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

app.post('/v1/user/self', async (req, res) => {
    try {
        if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
            res.status(400).send();
        }

        const username = await User.findOne({
            where: {
                username: req.body.username,
            },
        });
        console.log(username);
        if (username !== null) {
            res.status(409).send();
        }
        const passwordHash = await returnPasswordHash(req.body.password);
        console.log(passwordHash)
        await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: passwordHash,
            username: req.body.username
        });
        res.status(201).send();
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
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
