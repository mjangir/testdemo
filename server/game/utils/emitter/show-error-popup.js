import { EVT_EMIT_SHOW_ERROR_POPUP } from '../../constants';

/**
 * Show Error Popup
 * 
 * @param {Socket} socket
 * @param {String} message
 * @returns {*}
 */
export default function(socket, message) {
  socket.emit(EVT_EMIT_SHOW_ERROR_POPUP, {
    message: message
  });
}
