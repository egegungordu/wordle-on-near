#!/usr/bin/env bash

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable"
[ -z "$PLAYER1" ] && echo "Missing \$PLAYER1 environment variable"
[ -z "$PLAYER2" ] && echo "Missing \$PLAYER2 environment variable"

echo --------------------------------------------
echo
echo "cleaning up the /neardev folder"
echo
rm -rf ./neardev

# exit on first error after this point to avoid redeploying with successful build
set -e

echo --------------------------------------------
echo
echo "rebuilding the contract (release build)"
echo
yarn build:contract

echo --------------------------------------------
echo
echo "redeploying the contract"
echo
near dev-deploy ../contract/build/release/worduel.wasm

echo
echo
echo --------------------------------------------
echo run the following commands
echo 'Reminders:'
echo ' - <dev-123-456> is the account id of the deployed contract, which can be seen in the output of the contract deployment.'
echo ' - player1 and player2 must be different near accounts (can be a subaccount)'
echo '    Example:'
echo '     export PLAYER1=player1.myaccount.testnet'
echo '     export PLAYER1=player2.myaccount.testnet'
echo --------------------------------------------
echo 'export CONTRACT=<dev-123-456>'
echo 'export PLAYER1=<account id of player 1>'
echo 'export PLAYER2=<account id of player 2>'
echo "near call \$CONTRACT initContract --accountId \$CONTRACT"
echo

exit 0