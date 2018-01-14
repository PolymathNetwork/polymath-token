#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

export COUNTER=0

for value in {0..4}
do

  OFFSET=$(($COUNTER * 250))
  node scripts/csv_allocation 0x59c50fdcf177897cd0a2cfb153edcbbae057acb0 $OFFSET 250 > scripts/allocs/alloc_$value.txt
  COUNTER=$(($COUNTER + 1))
done
