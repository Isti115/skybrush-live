/**
 * @file
 * The single applicaiton-wide message hub that other objects can use to
 * send messages to the connected Skybrush server.
 */

import MessageHub from './flockwave/messages';

import { handleClockInformationMessage } from './model/clocks';
import {
  handleConnectionDeletionMessage,
  handleConnectionInformationMessage,
} from './model/connections';
import { handleObjectDeletionMessage } from './model/objects';

import { showError, showNotification } from './features/snackbar/actions';
import { semanticsFromSeverity } from './features/snackbar/types';

import flock from './flock';
import store from './store';

const { dispatch } = store;

/**
 * The single application-wide message hub that other objects can use to
 * send messages to the connected Skybrush server.
 *
 * Note that you need to connect the hub to a Socket.IO socket first before
 * using it.
 *
 * @type {MessageHub}
 */
const messageHub = new MessageHub();

messageHub.registerNotificationHandlers({
  'CLK-INF': (message) => handleClockInformationMessage(message.body, dispatch),
  'CONN-DEL': (message) =>
    handleConnectionDeletionMessage(message.body, dispatch),
  'CONN-INF': (message) =>
    handleConnectionInformationMessage(message.body, dispatch),
  'OBJ-DEL': (message) => handleObjectDeletionMessage(message.body, dispatch),
  'SYS-CLOSE': (message) => {
    if (message.body && message.body.reason) {
      dispatch(showError(message.body.reason));
    }
  },
  'SYS-MSG': (message) => {
    if (message.body && message.body.message) {
      const { severity } = message.body;
      dispatch(
        showNotification({
          message: message.body.message,
          semantics: semanticsFromSeverity(severity),
        })
      );
    }
  },
  'UAV-INF': (message) =>
    flock.handleUAVInformationMessage(message.body, dispatch),
});

export default messageHub;
