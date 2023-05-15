const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(reservationsId) {
    try {
        const collection = await dbService.getCollection('reservation')
        const reservations = await collection.find({ _id: { $in: reservationsId } }).toArray()
        return reservations
    } catch (err) {
        logger.error('cannot find reservations', err)
        throw err
    }
}

async function getById(reservationId) {
    try {
        const collection = await dbService.getCollection('reservation')
        const reservation = collection.findOne({ _id: ObjectId(reservationId) })
        return reservation
    } catch (err) {
        logger.error(`Cannot find reservation with id: ${reservationId}`, err)
    }
}

async function add(loggedInUser, reservation) {
    try {
        const collection = await dbService.getCollection('reservation')
        const addedReservation = await collection.insertOne(reservation)
        console.log('ADDED RESERVATION:', addedReservation.ops[0])
        return addedReservation.ops[0]
    } catch (err) {
        logger.error('cannot insert reservation', err)
        throw err
    }
}

async function update(reservation) {
    try {
        const reservationToSave = {
            status: reservation.status,
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(reservation._id) }, { $set: reservationToSave })
        return reservation
    } catch (err) {
        logger.error(`cannot update reservation ${reservation._id}`, err)
        throw err
    }
}

module.exports = {
    query,
    getById,
    add,
    update,
    addDemoReservations,
}
