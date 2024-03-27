const Logger = require('node-json-logger');
const fs = require('fs');

const altLogFile = './var/log/myapp.log';
const primaryLogFile = '/var/log/webapp/myapp.log';
const logger = new Logger({
  timestamp: true,
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});

// if (!fs.existsSync(logFile)) {
//   fs.writeFileSync(logFile, '');
// }

let logFile = primaryLogFile;
if (!fs.existsSync(primaryLogFile)) {
  if (fs.existsSync(altLogFile)) {
    logFile = altLogFile;
  } else {
    fs.writeFileSync(primaryLogFile, '');
    logFile = primaryLogFile;
  }
}


const logStream = fs.createWriteStream(logFile, { flags: 'a' });
process.stdout.write = logStream.write.bind(logStream);
process.stderr.write = logStream.write.bind(logStream);

logger.info('This is an info message');
module.exports = logger;
