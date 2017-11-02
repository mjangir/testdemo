'use strict';

import onPlaceBid from './placebid';
import onConnect from './connect';
import onDisconnect from './disconnect';
import jackpotTimer from './timer';

export default {
    onPlaceBid      : onPlaceBid,
    onConnect       : onConnect,
    onDisconnect    : onDisconnect,
    jackpotTimer    : jackpotTimer
}