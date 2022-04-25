#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$1" ] && echo "Missing \$1 argument" && exit 1

echo
echo
echo --------------------------------------------
echo "About to call finishGame() on the contract with $1"
echo near call \$CONTRACT finishGame --account_id \$1
echo
echo \$CONTRACT is $CONTRACT
echo \$1 is $1
echo --------------------------------------------
near call $CONTRACT finishGame --account_id $1
