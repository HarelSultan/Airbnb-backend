const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId
const DEFAULT_LABEL = 'All homes'
const DEFAULT_DESTINATION = `I'm Flexible`

async function query(pageIdx = 0, filterBy, searchBy, pageSize = 20) {
    try {
        const collection = await dbService.getCollection('stay')
        const criteria = _getCriteria(filterBy, searchBy)
        const staysCount = await collection.countDocuments(criteria)
        const pageCount = Math.ceil(staysCount / pageSize)
        const startIdx = pageSize * pageIdx
        const endIdx = startIdx + pageSize
        let stays = await collection.find(criteria).toArray()
        stays = stays.slice(startIdx, endIdx)
        // TODO:
        stays.forEach(stay => {
            // const takenDates = stay.reservations.map(reservation => reservation.dates) || []
            stay.randomAvaliableDates = utilService.getRandomDates([])
        })
        return { stays, pageCount }
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        return await collection.findOne({ _id: ObjectId(stayId) })
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function getUserStays(staysId) {
    try {
        const collection = await dbService.getCollection('stay')
        return await collection.find({ _id: { $in: staysId } }).toArray()
    } catch (err) {
        logger.error(`While getting user stays: ${staysId}`, err)
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    try {
        const stayToSave = {
            name: stay.name,
            type: stay.type,
            imgUrls: stay.imgUrls,
            price: stay.price,
            summary: stay.summary,
            amenities: stay.amenities,
            roomType: stay.roomType,
            randomAvaliableDates: stay.randomAvaliableDates,
            takenDates: stay.takenDates,
            loc: {
                country: stay.loc.country,
                countryCode: stay.loc.countryCode,
                city: stay.loc.city,
                address: stay.loc.address,
                destination: stay.loc.destination,
                lat: stay.loc.lat,
                lng: stay.loc.lng,
            },
            labels: stay.labels,
            stayDetails: {
                guests: stay.stayDetails.guests,
                bedrooms: stay.stayDetails.bedrooms,
                beds: stay.stayDetails.beds,
                bathrooms: stay.stayDetails.bathrooms,
            },
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

function _getCriteria(filterBy, searchBy) {
    const criteria = {}
    if (filterBy.label && filterBy.label !== DEFAULT_LABEL) {
        criteria.label = { $in: filterBy.label }
    }
    if (+filterBy.minPrice) {
        criteria.price = { $gt: +filterBy.minPrice }
    }
    if (+filterBy.maxPrice) {
        criteria.price.$lt = +filterBy.maxPrice
    }
    if (filterBy.type) {
        criteria.type = { $in: filterBy.type }
    }
    if (searchBy.destination && searchBy.destination !== DEFAULT_DESTINATION) {
        criteria['loc.destination'] = searchBy.destination
    }
    if (searchBy.checkIn && searchBy.checkOut) {
        criteria.reservations = {
            $not: {
                $elemMatch: {
                    'dates.checkIn': { $lt: new Date(searchBy.checkOut).toISOString() },
                    'dates.checkOut': { $gt: new Date(searchBy.checkIn).toISOString() },
                },
            },
        }
    }

    if (searchBy.guests) {
        const { adults, children } = searchBy.guests
        const guestCount = +adults + +children
        criteria['stayDetails.guests'] = { $gt: guestCount }
    }
    return criteria
}

module.exports = {
    query,
    getUserStays,
    getById,
    add,
    update,
    addReservation,
}
