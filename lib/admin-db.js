const { connectDatabase } = require('./db');

async function connectAdminDatabase() {
  await connectDatabase();
}

function getAdminModels() {
  return {
    Subscriber: require('./subscriber'),
    EmailEvent: require('./email-event'),
    NewsletterRun: require('./newsletter-run'),
    News: require('./news'),
    NewsDelivery: require('./news-delivery'),
    AdminUpdate: require('./admin-update')
  };
}

module.exports = { connectAdminDatabase, getAdminModels };
