const express = require('express');
const { register, login } = require('../Controllers/AuthController');
const { validateLogin, validateRegister } = require('../Middlewares/validation');
const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;