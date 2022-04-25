#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$1" ] && echo "Missing \$1 argument" && exit 1
[ -z "$2" ] && echo "Missing \$2 argument" && exit 1

echo
echo
echo --------------------------------------------
echo "About to call increaseBid() on the contract with $1, amount: $2"
echo near call \$CONTRACT increaseBid --account_id \$1 --amount \$2
echo
echo \$CONTRACT is $CONTRACT
echo \$1 is $1
echo \$2 is $2
echo --------------------------------------------
near call $CONTRACT increaseBid --account_id $1 --amount $2

