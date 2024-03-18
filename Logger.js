const Logger = require('node-json-logger');
const fs = require('fs');

const logFile = '/var/log/webapp/myapp.log';
const logger = new Logger();

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, '');
}

const logStream = fs.createWriteStream(logFile, { flags: 'a' });
process.stdout.write = logStream.write.bind(logStream);
process.stderr.write = logStream.write.bind(logStream);

logger.info('This is an info message');
module.exports = logger;
