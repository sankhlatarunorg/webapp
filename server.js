const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();
const base64 = require('base-64');
const workFactor = 8;
const bodyParser = require('body-parser');
const { checkIfPayloadIsEmpty } = require('./service');
const database = require('./Model');
const User = require('./Model').users;
const logger = require('./Logger');
const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

const topicName = 'verify_email';


var app = express();
app.use(bodyParser.json());

async function returnPasswordHash(password) {
    let salt = await bcrypt.genSalt(workFactor);
    return await bcrypt.hash(password, salt);
}

async function checkIfDBConnected() {
    try {
        logger.info("checking db connection");
        await database.sequelize.authenticate();
        return true;
    } catch (e) {
        logger.error("database not connected error:", e);
        return false;
    }
}

async function authenticate(req, res) {
    try {
        logger.info("checking auth header");
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.error("auth header not present");
            return res.status(400).send();
        }

        let check = await checkIfDBConnected();
        logger.info("db connection check:", check);
        if (check == false) {
            logger.error("db not connected");
            return res.status(503).send();
        }


        const credentials = base64.decode(authHeader.split(' ')[1]);
        const [username, password] = credentials.split(':');
        return User.findOne({ where: { username: username } })
            .then((user) => {
                logger.info("found user:", user);
                if (!user) {
                    return res.status(401).send();
                }
                if (user.is_verified === false && process.env.BUILD_ENV !== 'test') {
                    logger.error("error:", "user not verified");
                    return res.status(401).json({ "message": "Activate your account by verifying email" });
                }
                req.user = user;
                return bcrypt.compare(password, user.password).then((result) => {
                    logger.info("finished checking user");
                    if (!result) {
                        return res.status(401).send();
                    }
                }).catch((e) => {
                    logger.error("error:", e);
                    logger.trace("error:", e);
                    return res.status(400).send();
                });

            }).catch((e) => {
                logger.error("error:", e);
                return res.status(400).send();
            });

    } catch (e) {
        logger.trace("error:", e);
        return res.status(400);
    }
}

function checkIfHeaderIsPresent(req, res) {
    if (req.headers.authorization !== undefined) {
        logger.error("auth header present");
        return res.status(400).send();
    }
}

async function checkIfAuthenticated(req, res) {
    try {
        if (req.headers.authorization !== undefined) {
            return res.status(400).send();
        }
        return checkIfDBConnected().then((check) => {
            if (check === false) {
                logger.error("db not connected");
                return res.status(503).send();
            }
        }).catch((e) => {
            logger.trace(`error trace: ${e}`);
            logger.error(`error: ${e}`);
            return res.status(400).send();
        });

    } catch (e) {
        logger.trace(`error: ${e}`);
        return res.status(400).send();
    }
}

async function publishMessage(user) {
    try {
        const topic = pubSubClient.topic(topicName);
        const messageData = `${user.id}:${user.username}`;
        logger.info(`publishMessage messageData:  ${messageData}`);
        encodedMessageData = Buffer.from(messageData).toString('base64');

        logger.info(`encodedMessageData:  ${encodedMessageData}`);

        const decodedData = Buffer.from(encodedMessageData, 'base64').toString('utf-8');
        logger.info(`Decoded:  ${decodedData}`);
        logger.info(`Decoded:  ${decodedData.split(":")[0], decodedData.split(":")[1]}`);

        // messageData = base64.encode(messageData);
        // logger.info("publishMessage messageData encode:", info);
        // const decoded = base64.decode(messageData);
        // const userId = decoded.split(":")[0];
        // const email = decoded.split(":")[1];
        // logger.info("userId:", userId);
        // logger.info("email:", email);

        const dataBuffer = Buffer.from(JSON.stringify(messageData));
        logger.info(`dataBuffer:  ${dataBuffer}`);


        await topic.publish(dataBuffer);
        logger.info(`Message published successfully.`);

    } catch (error) {
        logger.error(`Error publishing message: ${error}`);
    }
}

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        logger.fatal(`error: ${error}`);
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
        logger.fatal("error:method not allowed");
        return res.status(405).send();
    }
    next();
});

app.use('/v1/user/self', (req, res, next) => {
    if (['GET', 'PUT', 'POST'].indexOf(req.method) === -1) {
        logger.fatal("error:method not allowed");
        return res.status(405).send();
    }
    next();
});

app.get('/v1/user/self', (req, res) => {
    try {
        if (Object.keys(req.body).length !== 0) {
            logger.warn("error:body not empty");
            return res.status(400).send();
        }
        if (Object.keys(req.query).length > 0) {
            logger.warn("error:query not empty");
            return res.status(400).send();
        }
        return authenticate(req, res)
            .then((result) => {
                if (result != undefined) {
                    logger.info("result status code:", result?.statusCode);
                    if ([503, 401, 400].indexOf(result?.statusCode) !== -1) {
                        return res.status(result.statusCode).send();
                    }
                }
                logger.info("Finished authenticating");
                const user = req.user;
                return res.status(200).send({
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "username": user.username,
                    "account_created": user.account_created,
                    "account_updated": user.account_updated
                })
            }).catch((e) => {
                logger.debug(`error: ${e}`);

                return res.status(400).send();
            });
    } catch (e) {
        logger.trace(`error: ${e}`);
        return res.status(400).send();
    }
});

app.put('/v1/user/self', async (req, res, next) => {
    try {
        const allowedParameters = ['first_name', 'last_name', 'password', 'username'];
        const receivedParameters = Object.keys(req.body);
        const invalidParameters = receivedParameters.filter(param => !allowedParameters.includes(param));
        if (invalidParameters.length > 0) {
            logger.warn("error: invalid parameters");
            return res.status(400).send();
        }
        return authenticate(req, res, next)
            .then((result) => {
                if (result != undefined) {
                    if ([503, 401, 400].indexOf(result?.statusCode) !== -1) {
                        return res.status(result.statusCode).send();
                    }
                }
                if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
                    logger.warn(`error: missing parameters put ${req.body.first_name} ${req.body.last_name} ${req.body.password} ${req.body.username}`);
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
                        logger.info("user updated");
                        return res.status(204).send()
                    }).catch((e) => {
                        logger.trace(`error: ${e}`);
                        logger.error(`error: ${e}`);
                        return res.status(400).send();
                    });
                }
                ).catch((e) => {
                    logger.trace(`error: ${e}`);
                    logger.error(`error: ${e}`);
                    return res.status(400).send();
                });
            }).catch((e) => {
                logger.trace(`error: ${e}`);
                logger.error(`error: ${e}`);
                return res.status(400).send();
            });
    } catch (e) {
        logger.trace(`error: ${e}`);
        return res.status(400).send();
    }
});

app.post('/v1/user/self', (req, res) => {
    try {
        const allowedParameters = ['first_name', 'last_name', 'password', 'username'];
        const receivedParameters = Object.keys(req.body);
        const invalidParameters = receivedParameters.filter(param => !allowedParameters.includes(param));
        if (invalidParameters.length > 0) {
            logger.warn("error:invalid parameters");
            return res.status(400).send();
        }
        return checkIfAuthenticated(req, res)
            .then((result) => {
                if ([503, 400].indexOf(result?.statusCode) !== -1) {
                    return res.status(result.statusCode).send();
                }
                if (req.body.first_name === undefined || req.body.last_name === undefined || req.body.password === undefined || req.body.username === undefined) {
                    // logger.warn("error:", "missing parameters");
                    logger.warn(`error: missing parameters post ${req.body.first_name} ${req.body.last_name} ${req.body.password} ${req.body.username}`);

                    return res.status(400).send();
                }
                return User.findOne({
                    where: {
                        username: req.body.username,
                    },
                }).then((username) => {
                    if (username !== null) {
                        logger.warn("error:username already exists");
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

                                if (process.env.BUILD_ENV === 'test') {
                                    return res.status(201).json({
                                        "id": user.id,
                                        "first_name": user.first_name,
                                        "last_name": user.last_name,
                                        "username": user.username,
                                        "account_created": user.account_created,
                                        "account_updated": user.account_updated,
                                        "is_verified": true,
                                    });
                                } else {
                                    publishMessage(user).then(() => {
                                        return res.status(201).json({
                                            "id": user.id,
                                            "first_name": user.first_name,
                                            "last_name": user.last_name,
                                            "username": user.username,
                                            "account_created": user.account_created,
                                            "account_updated": user.account_updated
                                        });
                                    }).catch((e) => {
                                        logger.error(`error: ${e}`);
                                        return res.status(400).send();
                                    });
                                }
                            });
                        }).catch((e) => {
                            logger.error(`error: ${e}`);
                            return res.status(400).send();
                        });;
                    }).catch((e) => {
                        logger.error(`error: ${e}`);
                        return res.status(400).send();
                    });
                }).catch((e) => {
                    logger.error(`error: ${e}`);
                    return res.status(400).send();
                });

            }).catch((e) => {
                logger.error(`error: ${e}`);
                return res.status(400).send();
            });
    } catch (e) {
        logger.trace(`error: ${e}`);
        return res.status(400).send();
    }
});


app.get('/healthz', function (req, res) {
    checkIfHeaderIsPresent(req, res);
    if (Object.keys(req.body).length !== 0) {
        logger.warn("error:body not empty");
        return res.status(400).send();
    }
    if (Object.keys(req.query).length > 0) {
        logger.warn("error:query not empty");
        return res.status(400).send();
    }
    (async () => {
        try {
            await database.sequelize.authenticate();
            logger.info("Connection has been established successfully.");
            return res.status(200).send();
        } catch (error) {
            logger.error("db not connected");
            return res.status(503).send();
        }
    })();
});

app.get('/logger', function (req, res) {
    logger.info("info message");
    logger.warn("warning message");
    logger.error("error message");
    logger.debug("debug message");
    logger.trace("trace message");
    logger.fatal("fatal message");
    return res.status(200).send();
});

app.get('/sync', function (req, res) {
    checkIfHeaderIsPresent(req, res);
    if (Object.keys(req.body).length !== 0) {
        logger.warn("error:body not empty");
        return res.status(400).send();
    }
    if (Object.keys(req.query).length > 0) {
        logger.warn("error:query not empty");
        return res.status(400).send();
    }
    (async () => {
        try {
            await database.sequelize.authenticate();
            (async () => {
                await User.sync({ force: true });
                logger.info("table created");
                const users = await User.findAll();
            })();
            logger.info("Connection has been established successfully.");
            return res.status(200).send();
        } catch (error) {
            logger.error(`Unable to connect to the database: ${error}`);
            return res.status(503).send();
        }
    })();
});


app.use('/verifyaccount', (req, res, next) => {
    if (['GET'].indexOf(req.method) === -1) {
        logger.fatal("error:method not allowed");
        return res.status(405).send();
    }
    next();
});

app.get('/verifyaccount', function (req, res) {
    try {
        logger.info(`req.query: ${req.query}`);
        const token = req.query.token;
        if (token === undefined) {
            logger.error("error:token not present");
            return res.status(400).send();
        }
        logger.info(`token: ${token}`);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

        const userId = decoded.split(":")[0];
        const email = decoded.split(":")[1];
        return User.findOne({ where: { id: userId, username: email } }).then((user) => {
            if (!user) {
                logger.error("error:user not found");
                return res.status(400).json({ "message": "User not found" });
            }
            if (user.is_verified === true) {
                logger.error("error: user already verified");
                return res.status(400).json({ "message": "User already verified" });
            }

            const currentTime = new Date();
            const verificationEmailTimestamp = new Date(user.verification_email_timestamp);
            logger.info(`currentTime: ${currentTime}`);
            logger.info(`verificationEmailTimestamp: ${verificationEmailTimestamp}`);
            const diff = currentTime - verificationEmailTimestamp;
            logger.info(`diff: ${diff}`);
            if (diff > 120000) {
                logger.error("error:token expired");
                return res.status(400).json({ "message": "Token expired" });
            }

            return User.update({
                is_verified: true
            }, {
                where: {
                    id: userId
                }
            }).then(() => {
                logger.info("user verified");
                return res.status(200).json({ "message": "User verified" });
            }).catch((e) => {
                // console.log('error:', e);
                logger.error(`error: ${e}`);

                return res.status(400).send();
            });
        }).catch((e) => {
            // console.log('error:', e);
            logger.error(`error: ${e}`);
            return res.status(400).send();
        });
    } catch (e) {
        // console.log('error:', e);
        logger.error("error:", e);
        return res.status(400).send();
    }
});

app.use('/', (req, res) => {
    logger.error("error: 404 not found");
    return res.status(404).send();
});

app.listen(3000, function () {
    logger.info('Health Check Application listening on port 3000!');
});


module.exports = app;
