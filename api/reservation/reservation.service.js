const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(criteria) {
    try {
        const collection = await dbService.getCollection('reservation')
        const reservations = await collection.find(criteria).toArray()
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
        return addedReservation.ops[0]
    } catch (err) {
        logger.error('cannot insert reservation', err)
        throw err
    }
}

async function addDemoReservations(demoUserListings, demoGuestsCredentials) {
    try {
        const collection = await dbService.getCollection('reservation')
        const demoReservations = demoUserListings.flatMap(listing => {
            const listingReservations = []
            while (listingReservations.length < 2) {
                const guest = Math.random() > 0.5 ? demoGuestsCredentials[0] : demoGuestsCredentials[1]
                const randomPastDate = utilService.getRandomPastDate()
                // Getting the dates that are already taken in order to prevent duplicated dates.
                const listingTakenDates = listingReservations.length
                    ? listingReservations.map(reservation => reservation.reservationDates)
                    : []
                const reservationDates = utilService.getRandomDates(listingTakenDates)
                const nightsCount = utilService.getNightsCount(reservationDates)
                const totalPayout = listing.price * nightsCount
                const reservation = {
                    stayId: listing._id,
                    stayName: listing.name,
                    stayLocation: {
                        city: listing.loc.city,
                        lat: listing.loc.lat,
                        lng: listing.loc.lng,
                    },
                    stayImgsUrl: listing.imgUrls,
                    host: listing.host,
                    guestId: guest._id,
                    guestName: guest.name,
                    reservationDates,
                    bookedAt: randomPastDate,
                    totalPayout,
                    guests: {
                        adults: 2,
                        children: 1,
                        infants: 1,
                        pets: 1,
                    },
                    status: 'pending',
                }
                listingReservations.push(reservation)
            }
            // return reservation
            return listingReservations
        })
        const reservations = await collection.insertMany(demoReservations)
        console.log('DEMO RESERVATIONS@@@@@@@@@@@', reservations)
        return reservations.ops
    } catch (err) {
        logger.error('Cannot add demo reservations with error:', err)
        throw err
    }
}

async function update(reservation) {
    try {
        const reservationToSave = {
            status: reservation.status,
        }
        const collection = await dbService.getCollection('reservation')
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
