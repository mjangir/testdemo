var socket;

jQuery(document).ready(function()
{
  socket = io.connect('ws://localhost:9000/jackpot', {
    path: '/ticktock/socket.io',
    query: {
      userId: USERID
    }
  });

  // On socket connect
  socket.on('connect', function()
  {
    socket.on('disconnect', function(data)
    {
      console.log("disconnected");
    });

    // When user joined a game
    socket.on('me_joined', function(data)
    {
      jQuery('#jackpot_id').val(data.jackpotInfo.uniqueId);
      jQuery('#jackpot-name').html(data.jackpotInfo.name);
      jQuery('#jackpot-amount').html(data.jackpotInfo.amount);
      jQuery('#my-name').html(data.userInfo.name);
      jQuery('#my-available-bids').html(data.userInfo.availableBids);
      jQuery('#total-bids-by-me').html(data.userInfo.totalPlacedBids);
      jQuery("#quit-game-button").hide();
    });

    // When jackpot game bid placed successfully
    socket.on('my_bid_placed', function(data)
    {
        jQuery('#my-available-bids').html(data.availableBids);
        jQuery('#total-bids-by-me').html(data.totalPlacedBids);
    });

    // Constant time updater
    socket.on('update_jackpot_timer', function(data)
    {
      jQuery('#game-clock').html(data.gameClockTime);
      jQuery('#doomsday-clock').html(data.doomsDayClockTime);
      jQuery('#current-bid-duration').html(data.lastBidDuration);
       jQuery('#longest-bid-duration').html(data.longestBidDuration);
       jQuery('#longest-bid-username').html(data.longestBidUserName);
    });

    // Updated jackpot data on any event occures
    socket.on('updated_jackpot_data', function(data)
    {
      if(data.activePlayers)
      {
        console.log(data);
        jQuery('#active-players').html(data.activePlayers);
        jQuery('#remaining-players').html(data.remainingPlayers);
        jQuery('#average-bid-bank').html(data.averageBidBank);
        jQuery('#total-users').html(data.totalUsers);
        jQuery('#total-bids').html(data.totalBids);
        jQuery('#current-bid-user').html(data.currentBidUser.name);

        if(data.canIBid == true)
        {
          jQuery('#place-bid').show();
        }
      }
    });

    // If I can bid or not
    socket.on('can_i_bid', function(data)
    {
      if(data.canIBid == true)
      {
        jQuery('#place-bid').show();
      }
      else
      {
        jQuery('#place-bid').hide();
      }
    });

    // Game finished
    socket.on('game_finished', function(data){
        console.log(data);
    });

    // Show quit button
    socket.on('show_quit_button', function(data)
    {
        jQuery("#quit-game-button").show();
    });

    // Got bid battle level list
    socket.on('normal_battle_level_list', function(data)
    {
      console.log(data);
        //renderBidBattleLevelList(data);
    });

    socket.on('currently_playing_bid_battle_level', function(data)
    {
      console.log(data);
        //renderBidBattleLevelList(data);
    });

  });
  
});

// When tab change
jQuery(document).on('shown.bs.tab', '#ticktock-tabs', function(e)
{
  var target = e.target.getAttribute('href');
  
  if(target == '#bid-battle-tab')
  {
    socket.emit('request_battle', {
        userId: USERID,
        jackpotUniqueId: jQuery('#jackpot_id').val()
    })
  }
});

// Place a bid
jQuery(document).on('click', '#place-bid', function(e)
{
    socket.emit('place_bid', {
        userId: USERID,
        jackpotUniqueId: jQuery('#jackpot_id').val()
    })
});

// Handle quiet game
jQuery(document).on('click', '#quit-game-button', function(e)
{
    socket.emit('quit_jackpot_game', {
        userId: USERID
    })
});