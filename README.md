Worduel
==================

Wordle dueling game built on near smart contracts.

<p align="middle">
  <img src="Screen%20Shot%202022-04-17%20at%2005.03.53.png" width="49%" />
  <img src="Screen%20Shot%202022-04-17%20at%2005.17.41.png" width="49%" /> 
</p>
<p align="middle">
  <img src="Screen%20Shot%202022-04-17%20at%2005.05.17.png" width="49%" /> 
  <img src="Screen%20Shot%202022-04-17%20at%2005.06.13.png" width="49%" />
</p>

### The Idea
- A new wordle game takes place every day. To get to participate in this game, players bid tokens to get in the top 2.
- Losers in the bidding phase get refunded. Top 2 players bid makes up the total bid.
- The game plays like wordle but with two players. Players take alternating turns to submit a word.
- The first player to find the word wins, if the word was not found the game is a draw.
- Winner gets the total bid and the total bid is shared equally when a draw occurs.
- The game has a time limit. When the time is up, anyone can claim the total bid.

# Try it

- Clone the project and run either `npm install` or `yarn`
- Make sure you are logged in on near-cli
- Deploy the contracts and the react webapp on development mode by `npm run dev` or `yarn dev`

# Functions in the contract
initContract
---
Initialize the contract with the necessary variables, word list etc.

Example call:
```
near call <contract-id> initContract --accountId <account-id>
```
getOwner
---
Get the account which initialized the contract


Example call:
```
near view <contract-id> getOwner
```
placeBid
---
Place a bid equal to the attached tokens in the transaction

Example call:
```
near call <contract-id> placeBid --accountId <account-id> --deposit <near-amount>
```
increaseBid
---
Increase the existent bid by the amount attached in the transaction

Example call:
```
near call <contract-id> increaseBid --accountId <account-id> --deposit <near-amount>
```
getTotalBidders
---
Get the total number of bidder in the current bidding session

Example call:
```
near view <contract-id> getTotalBidders
```
getTopBidders
---
Get top 10 bidders accountId and bid amounts

Example call:
```
near view <contract-id> getTopBidders
```
getBid
---
Get the bid amount of the given accountId

Example call:
```
near view <contract-id> getBid '{"accountId":"<account-id>"}'
```
startGame
---
Start the game with the current top 2 bidders
- Only players of the game (top 2 bidders) can call this function
- Players are incentivized to calling this function because they will lose their bets if they dont

Example call:
```
near call <contract-id> startGame --accountId <account-id>
```
finishGame
---
Finish the game if the game time is up
- Everyone is incentivized to calling this function because they can claim the total bid

Example call:
```
near call <contract-id> finishGame --accountId <account-id>
```
getGame
---
Get the current game state

Example call:
```
near view <contract-id> getGame
```
playGame
---
Play a word
- Only players of the game (top 2 bidders) can call this function
- Players are incentivized to call this function because game will timeout if they dont (and the total bid becomes claimable to everyone)

Example call:
```
near call <contract-id> playGame --accountId <account-id> '{"word":"<word>"}'
```
