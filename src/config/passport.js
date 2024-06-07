const OAuth2Strategy = require('passport-oauth2').Strategy;
const axios = require('axios');

module.exports = (passport) => {
  passport.use('outlook', new OAuth2Strategy({
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientID: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['openid', 'profile', 'offline_access', 'https://outlook.office.com/mail.read'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { data } = await axios.get('https://outlook.office.com/api/v2.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const user = {
        id: data.Id,
        displayName: data.DisplayName,
        email: data.EmailAddress,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
