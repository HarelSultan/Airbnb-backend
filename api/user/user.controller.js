const userService = require('./user.service')
const logger = require('../../services/logger.service')

async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}

async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

module.exports = {
    getUser,
    getUsers,
    updateUser,
}
