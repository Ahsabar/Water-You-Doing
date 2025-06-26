const admin = require('firebase-admin');
var serviceAccount = require('../water-you-doing-firebase-adminsdk-fbsvc-49637560a6.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;