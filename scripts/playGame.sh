#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$1" ] && echo "Missing \$1 argument" && exit 1
[ -z "$2" ] && echo "Missing \$2 argument" && exit 1

echo
echo
echo --------------------------------------------
echo "About to call playGame() on the contract with $1, word: $2"
echo near call \$CONTRACT playGame '{"word": "$2"}' --account_id \$1 --gas 50000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$1 is $1
echo \$2 is $2
echo --------------------------------------------
near call $CONTRACT playGame '{"word": "'$2'"}' --account_id $1 --gas 50000000000000
