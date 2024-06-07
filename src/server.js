const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { handleWebhookNotification } = require('./services/webhookService');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

require('./config/passport')(passport);

app.use('/auth', require('./routes/auth'));
app.use('/email', require('./routes/email'));

app.post('/webhook', handleWebhookNotification);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
