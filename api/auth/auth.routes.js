const express = require('express')
const { login, signup, logout, demoLogin } = require('./auth.controller')

const router = express.Router()

router.post('/login', login)
router.post('/demo', demoLogin)
router.post('/signup', signup)
router.post('/logout', logout)

module.exports = router
