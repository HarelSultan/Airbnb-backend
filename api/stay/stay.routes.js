const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getStays, getStayById, updateStay, getUserStays } = require('./stay.controller')
const router = express.Router()

router.get('/', log, getStays)
router.get('/user', requireAuth, getUserStays)
router.get('/:id', getStayById)
router.put('/:id', requireAuth, updateStay)

module.exports = router
