const { Client } = require('@microsoft/microsoft-graph-client');
const esClient = require('../config/elasticsearch');

// Function to synchronize emails from Outlook
const syncEmails = async (user) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, user.accessToken);
    },
  });

  try {
    // Fetch the user's emails using the Microsoft Graph API
    const messages = await client.api('/me/messages').get();

    for (const message of messages.value) {
      await esClient.index({
        index: 'emails',
        id: message.id,
        body: {
          userId: user.id,
          messageId: message.id,
          subject: message.subject,
          body: message.body.content,
          from: message.from.emailAddress.address,
          to: message.toRecipients.map(recipient => recipient.emailAddress.address),
          date: message.receivedDateTime,
          read: message.isRead,
          flagged: message.flag.flagStatus === 'flagged',
        },
      });
    }
  } catch (error) {
    console.error('Error syncing emails:', error);
  }
};

// Function to poll emails from Outlook periodically and update Elasticsearch
const pollEmails = async (user) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, user.accessToken);
    },
  });

  try {
    const messages = await client.api('/me/messages').get();
    for (const message of messages.value) {
      await esClient.index({
        index: 'emails',
        id: message.id,
        body: {
          userId: user.id,
          messageId: message.id,
          subject: message.subject,
          body: message.body.content,
          from: message.from.emailAddress.address,
          to: message.toRecipients.map(recipient => recipient.emailAddress.address),
          date: message.receivedDateTime,
          read: message.isRead,
          flagged: message.flag.flagStatus === 'flagged',
        },
      });
    }
  } catch (error) {
    console.error('Error polling emails:', error);
  }
};

// Function to monitor email changes using a polling mechanism
const monitorEmailChanges = async (user) => {
  // Set up a polling mechanism to check for email changes every 5 minutes
  setInterval(() => pollEmails(user), 5 * 60 * 1000);
};

module.exports = { syncEmails, monitorEmailChanges };
