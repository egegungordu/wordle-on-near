# Deploy and Initialize
1) Locate to the `scripts` directory
2) Run `dev-deploy.sh`
3) Export variables `CONTRACT`, `PLAYER1` and `PLAYER2` accordingly
4) Initialize the contract with `near call $CONTRACT initContract --accountId $CONTRACT"`

# Test
> **_NOTE:_** Make sure to redeploy after each game over to reset the timer
## Option 1
Run the full demo with `run-full-demo.sh`
## Option 2
Call the appropriate functions in the right order to 'simulate' a worduel session, which might look like:
1. `./placeBid $PLAYER1 0.00003`
2. `./placeBid $PLAYER2 0.00002`
3. `./startGame $PLAYER1`
4. `./playGame $PLAYER1 smile`
5. `./playGame $PLAYER2 pride`
6. `./playGame $PLAYER1 which`
7. `./playGame $PLAYER2 truck`
8. `./playGame $PLAYER1 truth`
9. `./playGame $PLAYER2 clean`
10. `./playGame $PLAYER1 marry`

> **_NOTE:_** Since the game requires certain conditions to be able to call certain functions, the call order is important. Redeploy to reset game state and bids.

Try out unexisting words:
- `./playGame $PLAYER1 bruhh`

View game state:
- `./getGame`

View top bidders:
- `./getTopBidders`

Increase current bid:
- `./increaseBid $PLAYER1 0.0001`

Wait for the 10 minute timer to run out and steal the game bid:
- `./finishGame <another account>`

