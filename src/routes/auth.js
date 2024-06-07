const express = require('express');
const passport = require('passport');
const { createAccount } = require('../controllers/authController');

const router = express.Router();

router.get('/outlook', passport.authenticate('outlook'));

router.get('/outlook/callback', 
  passport.authenticate('outlook', { failureRedirect: '/' }), 
  createAccount
);

module.exports = router;
