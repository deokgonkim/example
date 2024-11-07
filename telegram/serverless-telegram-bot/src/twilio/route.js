const express = require('express');
const twilio = require('./twilio');
const db = require('./db');
const { getOrder } = require('../order/db');

const router = express.Router();

/**
 * Twilio supports both WhatsApp and SMS messaging.
 */

router.get('/', async (req, res) => {
  res.json({ message: 'Hello from WhatsApp webhook!' });
});

/**
 * For SMS
 */
router.post('/sms', async (req, res) => {
  console.log('Received SMS Message', JSON.stringify(req.body, null, 4));

  res.json({ message: 'Message received!' });
});

/**
 * For WhatsApp
 */

/**
 * When a message comes in
 * to receive client message
 * 
 * default : https://timberwolf-mastiff-9776.twil.io/demo-reply
 */
router.post('/whatsapp', async (req, res) => {
  console.log('Received WhatsApp Message', JSON.stringify(req.body, null, 4));

  await db.recordWhatsapp(req.body);

  /**
   * @type {WhatsAppMessage}
   */
  const whatsappMessage = req.body;
  
  const whatsappUserId = whatsappMessage.From;
  console.log('WhatsApp UserId:', whatsappUserId);
  const whatsappUser = await db.getWhatsAppUserById(whatsappUserId);
  if (whatsappUser) {
    console.log('WhatsApp User:', whatsappUser);
  } else {
    await db.recordWhatsAppUser({
      whatsappUserId: whatsappUserId,
      ProfileName: whatsappMessage.ProfileName,
    });
  }

  if (whatsappMessage.Body.startsWith('My Order')) {
    // Message format: My Order is <orderId>
    const regexp = /My Order is (\w+)/;
    const orderId = whatsappMessage.Body.match(regexp)[1];
    console.log('Order ID:', orderId);
    const order = await getOrder(orderId);
    if (order) {
      const userId = order.userId;
      await db.recordWhatsAppUser({
        whatsappUserId: whatsappMessage.From,
        ProfileName: whatsappMessage.ProfileName,
      }, userId, orderId);
    }
  }

  res.json({ message: 'Message received!' });
});

/**
 * Status callback URL
 * 
 * to receive status of delivery that we sent from our side
 * 
 * default : none
 */
router.post('/whatsapp/status-callback', async (req, res) => {
    console.log('received status callback', JSON.stringify(req.body, null, 4));
    
    res.json({ message: 'Status callback received!' });
});

module.exports = router;
