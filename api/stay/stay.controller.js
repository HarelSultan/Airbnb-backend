const stayService = require('./stay.service.js')
const ObjectId = require('mongodb').ObjectId

const logger = require('../../services/logger.service.js')

async function getStays(req, res) {
    try {
        logger.debug('Getting Stays')
        const { pageIdx, filterBy, searchBy } = req.query
        const stays = await stayService.query(pageIdx, filterBy, searchBy)
        res.json(stays)
    } catch (err) {
        logger.error('Failed to get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}

async function getUserStays(req, res) {
    try {
        logger.debug('Getting user stays')
        let { staysId } = req.query
        staysId = staysId.map(id => ObjectId(id))
        const stays = await stayService.getUserStays(staysId)
        res.json(stays)
    } catch (err) {
        logger.error('Failed to get user stays', err)
        res.status(500).send({ err: 'Failed to get user stays' })
    }
}

async function getStayById(req, res) {
    try {
        const stayId = req.params.id
        const stay = await stayService.getById(stayId)
        res.json(stay)
    } catch (err) {
        logger.error('Failed to get stay', err)
        res.status(500).send({ err: 'Failed to get stay' })
    }
}

async function addStay(req, res) {
    const { loggedinUser } = req
    console.log(loggedinUser)
    try {
        const stay = req.body
        delete stay._id
        const addedStay = await stayService.add(stay)
        res.json(addedStay)
    } catch (err) {
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

async function updateStay(req, res) {
    try {
        const stay = req.body
        const updatedStay = await stayService.update(stay)
        res.json(updatedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })
    }
}

module.exports = {
    getStays,
    getUserStays,
    getStayById,
    addStay,
    updateStay,
}
