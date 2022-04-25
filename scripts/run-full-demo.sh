#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$PLAYER1" ] && echo "Missing \$PLAYER1 environment variable" && exit 1
[ -z "$PLAYER2" ] && echo "Missing \$PLAYER2 environment variable" && exit 1

echo
echo 'Running a demo of $PLAYER1 and $PLAYER2 bidding, playing the game and ending the game'
echo 'Reminder: Since the hidden word is random, the outcome of the game is also random'
echo 'Every function call of this demo in order:'
echo '    1) player1 bids 0.00001 near tokens'
echo '    2) player2 bids 0.00002 near tokens'
echo '    3) top bidders are shown'
echo '    4) player1 increases their bid by 0.00002 near tokens'
echo '    5) top bidders are shown'
echo '    6) player1 starts the game'
echo '    7) game state is shown'
echo '    8) player1 plays the word "smile"'
echo '    9) game state is shown'
echo '    10) player2 plays the word "crane"'
echo '    11) player1 plays the word "plane"'
echo '    12) player2 plays the word "merry"'
echo '    13) player1 plays the word "truck"'
echo '    14) player2 plays the word "trial"'
echo '    15) player1 plays the word "prone"'
echo '    16) game state is shown'

echo
echo
echo --------------------------------------------
echo 'About to call placeBid() on the contract with PLAYER1'
echo near call \$CONTRACT placeBid --account_id \$PLAYER1 --amount 0.00001
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT placeBid --account_id $PLAYER1 --amount 0.00001

echo
echo
echo --------------------------------------------
echo 'About to call placeBid() on the contract with PLAYER2'
echo near call \$CONTRACT placeBid --account_id \$PLAYER2 --amount 0.00002
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER2 is $PLAYER2
echo --------------------------------------------
near call $CONTRACT placeBid --account_id $PLAYER2 --amount 0.00002

echo
echo
echo --------------------------------------------
echo 'About to view getTopBidders() on the contract'
echo near view \$CONTRACT getTopBidders
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getTopBidders

echo
echo
echo --------------------------------------------
echo 'About to call increaseBid() on the contract with PLAYER1'
echo near call \$CONTRACT increaseBid --account_id \$PLAYER1 --amount 0.00002
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT increaseBid --account_id $PLAYER1 --amount 0.00002

echo
echo
echo --------------------------------------------
echo 'About to view getTopBidders() on the contract'
echo near view \$CONTRACT getTopBidders
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getTopBidders

echo
echo
echo --------------------------------------------
echo 'About to call startGame() on the contract with PLAYER1'
echo near call \$CONTRACT startGame --account_id \$PLAYER1
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT startGame --account_id $PLAYER1

echo
echo
echo --------------------------------------------
echo 'About to view getGame() on the contract'
echo near view \$CONTRACT getGame 
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getGame

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER1'
echo near call \$CONTRACT playGame '{"word": "smile"}' --account_id \$PLAYER1 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "smile"}' --account_id $PLAYER1 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to view getGame() on the contract'
echo near view \$CONTRACT getGame 
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getGame

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER2'
echo near call \$CONTRACT playGame '{"word": "crane"}' --account_id \$PLAYER2 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER2 is $PLAYER2
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "crane"}' --account_id $PLAYER2 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER1'
echo near call \$CONTRACT playGame '{"word": "plane"}' --account_id \$PLAYER1 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "plane"}' --account_id $PLAYER1 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER2'
echo near call \$CONTRACT playGame '{"word": "merry"}' --account_id \$PLAYER2 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER2 is $PLAYER2
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "merry"}' --account_id $PLAYER2 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER1'
echo near call \$CONTRACT playGame '{"word": "truck"}' --account_id \$PLAYER1 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "truck"}' --account_id $PLAYER1 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER2'
echo near call \$CONTRACT playGame '{"word": "trial"}' --account_id \$PLAYER2 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER2 is $PLAYER2
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "trial"}' --account_id $PLAYER2 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to call playGame() on the contract with PLAYER1'
echo near call \$CONTRACT playGame '{"word": "prone"}' --account_id \$PLAYER1 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER1 is $PLAYER1
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "prone"}' --account_id $PLAYER1 --gas 50000000000000

echo
echo
echo --------------------------------------------
echo 'About to view getGame() on the contract'
echo near view \$CONTRACT getGame 
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getGame