#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1

echo
echo
echo --------------------------------------------
echo "About to view getTopBidders() on the contract"
echo near view \$CONTRACT getTopBidders
echo
echo \$CONTRACT is $CONTRACT
echo --------------------------------------------
near view $CONTRACT getTopBidders

