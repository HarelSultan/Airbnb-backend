const reservationService = require('./reservation.service')
const userService = require('../user/user.service')
const stayService = require('../stay/stay.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function getReservations(req, res) {
    try {
        let { reservationsId } = req.query
        reservationsId = reservationsId.map(reservationId => ObjectId(reservationId))
        const criteria = { _id: { $in: reservationsId } }
        const reservations = await reservationService.query(criteria)
        res.send(reservations)
    } catch (err) {
        logger.error('Failed to get reservations', err)
        res.status(500).send({ err: 'Failed to get reservations' })
    }
}

async function getHostReservations(req, res) {
    try {
        const { hostId } = req.query
        const criteria = { 'host._id': hostId }
        const reservations = await reservationService.query(criteria)
        res.send(reservations)
    } catch (err) {
        logger.error('Failed to get host reservations', err)
        res.status(500).send({ err: 'Failed to get host reservations' })
    }
}

async function getReservation(req, res) {
    try {
        const reservation = await reservationService.getById(req.params.id)
        res.send(reservation)
    } catch (err) {
        logger.error('Failed to get reservation', err)
        res.status(500).send({ err: 'Failed to get reservation' })
    }
}

async function addReservation(req, res) {
    try {
        const { loggedinUser } = req
        const reservation = req.body
        const addedReservation = await reservationService.add(loggedinUser, reservation)
        await stayService.addReservation(addedReservation)
        const updatedGuest = await userService.addTrip(loggedinUser._id, addedReservation._id)
        res.send(updatedGuest)
    } catch (err) {
        logger.error('Failed to add reservation', err)
        res.status(500).send({ err: 'Failed to add reservation' })
    }
}

async function updateReservation(req, res) {
    try {
        const reservation = req.body
        await reservationService.update(reservation)
        res.send(reservation)
    } catch (err) {
        logger.error('Failed to update reservation', err)
        res.status(500).send({ err: 'Failed to update reservation' })
    }
}

module.exports = {
    getReservation,
    getReservations,
    getHostReservations,
    addReservation,
    updateReservation,
}
