const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByUsername,
    update,
    add,
    addTrip,
    updateUsers,
}

async function query() {
    try {
        const collection = await dbService.getCollection('user')
        let users = await collection.find().toArray()
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: ObjectId(userId) })
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('user')
        const userToSave = {
            _id: ObjectId(user._id), // needed for the returnd obj
            fullName: user.fullName,
            wishListStaysId: user.wishListStaysId,
            listingsId: user.listingsId,
            tripsId: user.trips,
        }
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function addTrip(userId, tripId) {
    try {
        const collection = await dbService.getCollection('user')
        const res = await collection.findOneAndUpdate(
            { _id: ObjectId(userId) },
            { $push: { tripsId: tripId } },
            { returnOriginal: false }
        )
        const updatedUser = res.value
        delete updatedUser.password
        return updatedUser
    } catch (err) {
        logger.error(`Cannot add trip ${tripId} to user ${userId} with error:`, err)
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullName: user.fullName,
            imgUrl: user.imgUrl,
            wishListStaysId: [],
            listingsId: [],
            tripsId: [],
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

async function updateUsers(demoGuestsCredentials, demoReservations) {
    try {
        const collection = await dbService.getCollection('user')
        const bulkUpdateOperations = demoGuestsCredentials.map(guest => {
            const guestId = guest._id
            const updatedField = {
                tripsId: demoReservations
                    .filter(reservation => reservation.guestId === guestId)
                    .map(reservation => reservation._id),
            }
            return {
                updateOne: {
                    filter: { _id: ObjectId(guestId) },
                    update: { $set: updatedField },
                },
            }
        })
        await collection.bulkWrite(bulkUpdateOperations)
    } catch (err) {
        logger.error('Cannot update users', err)
        throw err
    }
}
