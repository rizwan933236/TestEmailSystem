const { Client } = require('@microsoft/microsoft-graph-client');

const getEmails = async (req, res) => {
  const num = req.params.num;
  const userAccessToken = req.session.user.accessToken;

  if (!userAccessToken) {
    return res.status(401).send("User not authenticated. Please sign in first.");
  }

  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, userAccessToken);
      },
    });

    const messages = await client.api('/me/messages').top(num).get();
    res.send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = { getEmails };
