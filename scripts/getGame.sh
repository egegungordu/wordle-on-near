#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1

echo
echo
echo --------------------------------------------
echo "About to view getGame() on the contract"
echo near view \$CONTRACT getGame
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getGame

