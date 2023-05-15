const logger = require('../services/logger.service')

async function log(req, res, next) {
    next()
}

module.exports = {
    log,
}
