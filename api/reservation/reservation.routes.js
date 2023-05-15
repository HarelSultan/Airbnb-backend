const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { getReservations, getReservation, addReservation } = require('./reservation.controller')
const router = express.Router()

router.get('/', requireAuth, getReservations)
router.get('/:id', requireAuth, getReservation)
router.post('/', requireAuth, addReservation)
// router.put('/:id', requireAuth, updateReservation)

module.exports = router
