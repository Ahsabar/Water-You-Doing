let storedFcmToken = null;

module.exports = {
  setFcmToken: (token) => {
    storedFcmToken = token;
  },
  getFcmToken: () => storedFcmToken,
  clearFcmToken: () => {
    storedFcmToken = null;
  }
};