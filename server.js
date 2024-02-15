const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const base64 = require('base-64');
const workFactor = 8;
const bodyParser = require('body-parser');
const { checkIfPayloadIsEmpty } = require('./service');
const database = require('./Model');
const User = require('./Model').users;

var app = express();
app.use(bodyParser.json());

async function returnPasswordHash(password) {
    let salt = await bcrypt.genSalt(workFactor);
    return await bcrypt.hash(password, salt);
}

async function checkIfDBConnected() {
    try {
        await database.sequelize.authenticate();
        return true;
    } catch (e) {
        console.log("database not connected error:", e);
        return false;
    }
}

async function authenticate(req, res) {
    try {
        console.log("checking auth header");
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(400).send();
        }

        console.log('authenticating');
        let check = await checkIfDBConnected();
        console.log("checking db connection ");
        console.log("check:", check);
        if (check == false) {
            return res.status(503).send();
        }


        const credentials = base64.decode(authHeader.split(' ')[1]);
        const [username, password] = credentials.split(':');
        console.log(username, password);
        console.log("checking user");
        return User.findOne({ where: { username: username } })
            .then((user) => {
                console.log("found user: ", user);
                if (!user) {
                    return res.status(401).send();
                }
                req.user = user;
                return bcrypt.compare(password, user.password).then((result) => {
                    console.log("password result:", result);
                    console.log("finished checking user");
                    if (!result) {
                        return res.status(401).send();
                    }
                }).catch((e) => {
                    console.log(e);
                    return res.status(400).send();
                });

            }).catch((e) => {
                console.log(e);
                return res.status(400).send();
            });

    } catch (e) {
        console.log(e);
        return res.status(400);
    }
}

function checkIfHeaderIsPresent(req, res) {
    if (req.headers.authorization !== undefined) {
        return res.status(400).send();
    }
}

async function checkIfAuthenticated(req, res) {
    try {
        console.log('checking if authenticated');
        if (req.headers.authorization !== undefined) {
            return res.status(400).send();
        }
        return checkIfDBConnected().then((check) => {
            if (check === false) {
                return res.status(503).send();
            }
        }).catch((e) => {
            console.log(e);
            return res.status(400).send();
        });

    } catch (e) {
        console.log(e);
        return res.status(400).send();
    }
}

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        return res.status(400).send();
    }
    next();
});

app.use('/', (req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    next();
});

app.use('/healthz', (req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(405).send();
    }
    next();
});

app.use('/v1/user/self', (req, res, next) => {
    if (['GET', 'PUT', 'POST'].indexOf(req.method) === -1) {
        return res.status(405).send();
    }
    next();
});

app.get('/v1/user/self', (req, res) => {
    try {
        if (Object.keys(req.body).length !== 0) {
            return res.status(400).send();
        }
        if (Object.keys(req.query).length > 0) {
            return res.status(400).send();
        }
        return authenticate(req, res)
            .then((result) => {
                if (result != undefined) {
                    console.log("result status code:", result?.statusCode);
                    if ([503, 401, 400].indexOf(result?.statusCode) !== -1) {
                        console.log("checking status code");
                        return res.status(result.statusCode).send();
                    }
                }
                console.log("Finished authenticating");
                console.log("get user self");
                const user = req.user;
                console.log("response stats code:", res.statusCode);
                console.log("response headers: ", res.getHeaders());
                return res.status(200).send({
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "username": user.username,
                    "account_created": user.account_created,
                    "account_updated": user.account_updated
                })
            }).catch((e) => {
                console.log(e);
                return res.status(400).send();
            });
    } catch (e) {
        console.log(e);
        return res.status(400).send();
    }
});

app.put('/v1/user/self', async (req, res, next) => {
    try {
        const allowedParameters = ['first_name', 'last_name', 'password', 'username'];
        const receivedParameters = Object.keys(req.body);
        const invalidParameters = receivedParameters.filter(param => !allowedParameters.includes(param));
        if (invalidParameters.length > 0) {
            return res.status(400).send();
        }
        return authenticate(req, res, next)
            .then((result) => {
                if (result != undefined) {
                    console.log("result status code:", result?.statusCode);
                    if ([503, 401, 400].indexOf(result?.statusCode) !== -1) {
                        console.log("checking status code");
                        return res.status(result.statusCode).send();
                    }
                }
                console.log("Finished authenticating");
                if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
                    return res.status(400).send();
                }
                return returnPasswordHash(req.body.password).then((passwordHash) => {
                    return User.update({
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        password: passwordHash                    
                    }, {
                        where: {
                            id: req.user.id
                        }
                    }).then(() => {
                        return res.status(204).send()
                    }).catch((e) => {
                        console.log(e);
                        return res.status(400).send();
                    });
                }
                ).catch((e) => {
                    console.log(e);
                    return res.status(400).send();
                });
            }).catch((e) => {
                console.log(e);
                return res.status(400).send();
            });
    } catch (e) {
        console.log(e);
        return res.status(400).send();
    }
});

app.post('/v1/user/self', (req, res) => {
    try {
        const allowedParameters = ['first_name', 'last_name', 'password', 'username'];
        const receivedParameters = Object.keys(req.body);
        const invalidParameters = receivedParameters.filter(param => !allowedParameters.includes(param));
        if (invalidParameters.length > 0) {
            return res.status(400).send();
        }
        return checkIfAuthenticated(req, res)
            .then((result) => {
                if ([503, 400].indexOf(result?.statusCode) !== -1) {
                    return res.status(result.statusCode).send();
                }
                console.log("post user self");
                if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
                    return res.status(400).send();
                }
                return User.findOne({
                    where: {
                        username: req.body.username,
                    },
                }).then((username) => {
                    console.log(username);
                    if (username !== null) {
                        return res.status(409).send();
                    }
                    return returnPasswordHash(req.body.password).then((passwordHash) => {
                        return User.create({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            password: passwordHash,
                            username: req.body.username
                        }).then(() => {
                            return User.findOne({
                                where: {
                                    username: req.body.username,
                                },
                            }).then((user) => {
                                return res.status(201).json({
                                    "id": user.id,
                                    "first_name": user.first_name,
                                    "last_name": user.last_name,
                                    "username": user.username,
                                    "account_created": user.account_created,
                                    "account_updated": user.account_updated
                                });
                            });
                        }).catch((e) => {
                            console.log(e);
                            return res.status(400).send();
                        });;
                    }).catch((e) => {
                        console.log(e);
                        return res.status(400).send();
                    });
                }).catch((e) => {
                    console.log(e);
                    return res.status(400).send();
                });

            }).catch((e) => {
                console.log(e);
                return res.status(400).send();
            });
    } catch (e) {
        console.log(e);
        return res.status(400).send();
    }
});


app.get('/healthz', function (req, res) {
    checkIfHeaderIsPresent(req, res);
    if (Object.keys(req.body).length !== 0) {
        return res.status(400).send();
    }
    if (Object.keys(req.query).length > 0) {
        return res.status(400).send();
    }
    (async () => {
        try {
            await database.sequelize.authenticate();
            (async () => {
                await User.sync({ force: true });
                // Table created
                const users = await User.findAll();
                console.log("Users:")
                console.log(users);

            })();
            console.log('Connection has been established successfully.');
            return res.status(200).send();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            return res.status(503).send();
        }
    })();
});

app.use('/', (req, res) => {
    console.log("404 not found  ");
    return res.status(404).send();
});

app.listen(3000, function () {
    console.log('Health Check Application listening on port 3000!');
});


// module.exports = server
