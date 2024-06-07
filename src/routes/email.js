const express = require('express');
const { getEmails } = require('../controllers/emailController');

const router = express.Router();

router.get('/:num', getEmails);

module.exports = router;
