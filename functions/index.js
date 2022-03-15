const firebase_tools = require('firebase-tools');
const functions = require('firebase-functions');

exports.recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async (data, context) => {
    const path = data.path;
    await firebase_tools.firestore
      .delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
      });

    return {
      path: path 
    };
  });