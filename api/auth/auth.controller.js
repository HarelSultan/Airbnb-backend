const authService = require('./auth.service')
const logger = require('../../services/logger.service')

async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function demoLogin(req, res) {
    try {
        const demoUserCredentials = {
            username: 'Demo123',
            password: 'Demo123',
            fullname: 'Chiro De Marzio',
            imgUrl: 'https://res.cloudinary.com/dp32ucj0y/image/upload/v1674657025/qjkthitcs6pbonblobmi.jpg',
        }
        const demoGuestsCredentials = [
            {
                _id: '646263c554774425403fcd2c',
                name: 'Jenaro Sabastano',
            },
            {
                _id: '646263d654774425403fcd2d',
                name: 'Avi Sabastano',
            },
        ]
        let demoUser = await authService.login(demoUserCredentials.username, demoUserCredentials.password)
        // Converting listingsId to mongo ObjectId
        const listingsId = demoUser.listingsId.map(listingId => ObjectId(listingId))
        // Getting the demo user listings data
        const demoUserListings = await stayService.getUserStays(listingsId)
        // Adding demo reservations to reservations_db
        const demoReservations = await reservationService.addDemoReservations(demoUserListings, demoGuestsCredentials)
        // updating the demo guests with the added reservations ids
        await userService.updateUsers(demoGuestsCredentials, demoReservations)
        // updating the demo host listings with the added reservations ids and dates
        await stayService.updateStays(listingsId, demoReservations)

        const loginToken = authService.getLoginToken(demoUser)
        logger.info('Demo user login: ', demoUser)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(demoUser)
    } catch (err) {
        logger.error('Cannot set demo login please try again later')
        throw err
    }
}

async function signup(req, res) {
    try {
        const credentials = req.body
        const account = await authService.signup(credentials)
        // Deleting user's password from logger
        const loggerAccount = { ...account }
        delete loggerAccount.password
        logger.debug(`auth.route - new account created: ` + JSON.stringify(loggerAccount))
        const user = await authService.login(credentials.username, credentials.password)
        logger.info('User signup:', user)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout,
    demoLogin,
}
