const { syncEmails } = require('../services/emailSync');
const { createSubscription } = require('../services/webhookService');

const createAccount = async (req, res) => {
  const user = req.user;
  req.session.user = user;

  try {
    // Start email synchronization
    await syncEmails(user);

    // Create webhook subscription
    await createSubscription(user);

    res.redirect('/'); // Redirect to user dashboard or home page
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = { createAccount };