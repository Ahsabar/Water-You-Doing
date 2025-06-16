let controllerSocket = null;

module.exports = {
  setControllerSocket: (socket) => {
    controllerSocket = socket;
  },
  getControllerSocket: () => controllerSocket,
  clearControllerSocket: () => {
    controllerSocket = null;
  }
};