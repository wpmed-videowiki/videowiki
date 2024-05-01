import io from "socket.io-client";
import * as websocketsEvents from "./events";

let connection;
const createWebsocketConnection = function createWebsocketConnection(
  url,
  options = {}
) {
  connection = io(url, options);
  console.log("Connecting")
  return connection;
};

const disconnectConnection = function disconnectConnection() {
  if (connection) return connection.disconnect();
};

const emitEvent = function emitEvent(event, args) {
  return connection.emit(event, args);
};

const subscribeToEvent = function subscribeToEvent(event, callback) {
  console.log("Subscribing to event", event)
  return connection.on(event, callback);
};

const unsubscribeFromEvent = function unsubscribeFromEvent(event) {
  return connection.removeEventListener(event);
};

export default {
  createWebsocketConnection,
  disconnectConnection,
  emitEvent,
  subscribeToEvent,
  unsubscribeFromEvent,
  websocketsEvents,
};
