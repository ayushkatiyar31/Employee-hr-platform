const express = require('express');
const { register, login, getMe } = require('../Controllers/AuthController');
const { validateLogin, validateRegister } = require('../Middlewares/validation');
const { auth } = require('../Middlewares/auth');
const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', auth, getMe);

module.exports = router;
