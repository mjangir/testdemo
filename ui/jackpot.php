<div class="bgwhite pad10 col-md-12">
    <div class="row pad10 text-bold">
        <div class="col-md-6 text-left">
            <div class="row">
                <div class="col-md-6 text-left" id="jackpot-name"></div>
                <div class="col-md-6 text-right" id="jackpot-amount"></div>
            </div>
        </div>
        <div class="col-md-6 text-right">
            <div class="row">
                <div class="col-md-6 text-left" id="game-clock"></div>
                <div class="col-md-6 text-right" id="doomsday-clock"></div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6 text-left">
            <table class="table table-bordered">
                <tbody>
                  <tr>
                    <td>Active Players</td>
                    <td id="active-players"></td>
                  </tr>
                  <tr>
                    <td>Remaining Players</td>
                    <td id="remaining-players"></td>
                  </tr>
                  <tr>
                    <td>Average Bid Bank</td>
                    <td id="average-bid-bank"></td>
                  </tr>
                  <tr>
                    <td>Current Bid User</td>
                    <td id="current-bid-user"></td>
                  </tr>
                  <tr>
                    <td>Current Bid Duration</td>
                    <td id="current-bid-duration"></td>
                  </tr>
                  <tr>
                    <td>Longest Bid Duration</td>
                    <td id="longest-bid-duration"></td>
                  </tr>
                  <tr>
                    <td>Longest Bid User</td>
                    <td id="longest-bid-username"></td>
                  </tr>
                  <tr>
                    <td>Total Bids</td>
                    <td id="total-bids"></td>
                  </tr>
                  <tr>
                    <td>Total Users</td>
                    <td id="total-users"></td>
                  </tr>
                </tbody>
            </table>
        </div>
        <div class="col-md-6 text-right">
            <table class="table table-bordered">
                <tbody>
                  <tr>
                    <td>My Name</td>
                    <td id="my-name"></td>
                  </tr>
                  <tr>
                    <td>My Available Bids</td>
                    <td id="my-available-bids"></td>
                  </tr>
                  <tr>
                    <td>Total Bids By Me</td>
                    <td id="total-bids-by-me"></td>
                  </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12 text-center">
            <button class="btn btn-primary" id="place-bid">Place A Bid</button>
            &nbsp;
            <button class="btn btn-danger" id="quit-game-button" style="display: none;">Quit Game</button>
        </div>
    </div>
</div>
<input type="hidden" name="" id="jackpot_id">