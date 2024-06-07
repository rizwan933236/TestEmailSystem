const axios = require('axios');
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({ node: process.env.ELASTICSEARCH_HOST });

const createSubscription = async (user) => {
  try {
    const response = await axios.post('https://graph.microsoft.com/v1.0/subscriptions', {
      changeType: 'created,updated,deleted',
      notificationUrl: `${process.env.WEBHOOK_URL}/webhook`,
      resource: `/users/${user.id}/mailFolders('inbox')/messages`,
      expirationDateTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1 hour
      clientState: 'secretClientValue',
    }, {
      headers: { Authorization: `Bearer ${user.accessToken}` }
    });

    console.log('Subscription created:', response.data);
  } catch (error) {
    console.error('Error creating subscription:', error.response.data);
  }
};

const handleWebhookNotification = async (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).send(validationToken); // Validate the webhook endpoint
  } else {
    const notifications = req.body.value;
    for (const notification of notifications) {
      await handleNotification(notification);
    }
    res.status(202).send();
  }
};

const handleNotification = async (notification) => {
  try {
    const { resource } = notification;
    const user = await getUserById(notification.userId); // Implement getUserById to fetch user details
    const response = await axios.get(`https://graph.microsoft.com/v1.0${resource}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` }
    });

    const message = response.data;
    await esClient.index({
      index: 'email_messages',
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
  } catch (error) {
    console.error('Error handling notification:', error.response.data);
  }
};

module.exports = { createSubscription, handleWebhookNotification };
