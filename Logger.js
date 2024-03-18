const Logger = require('node-json-logger');
const fs = require('fs');
const path = require('path');

const logFilePath = '/var/log/webapp/myapp.log';

const logger = new Logger({
  logFilePath,
  timestampFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
});

module.exports = logger;
