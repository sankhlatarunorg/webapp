// Description: This file contains the middleware functions for the service routes.
function checkIfPayloadIsEmpty(req, res) {
    console.log(req.route,req.method);
    if (Object.keys(req.body).length !== 0) {
        return res.status(400).send();
    }
    if (Object.keys(req.query).length > 0) {
        return res.status(400).send();
    }
}

module.exports = { checkIfPayloadIsEmpty};
