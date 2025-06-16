const admin = require('firebase-admin');
var serviceAccount = require('../wateryoudoing-46bde-firebase-adminsdk-fbsvc-2aadecbf1d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;