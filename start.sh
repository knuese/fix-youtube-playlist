#!/bin/bash

export DEBUG_PORT=$(( ( RANDOM % 16383 ) + 49152 ))
echo "DEBUG_PORT=$DEBUG_PORT"

set -m

# Array to hold PIDs
pids=()

# Start processes and save their PIDs in the array
"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" --remote-debugging-port=$DEBUG_PORT &
pids+=($!)

npm run server &
pids+=($!)

npm run client &
pids+=($!)

(cd playwright && DEBUG_PORT=$DEBUG_PORT npx playwright test) &
pids+=($!)

# Recursive function to kill a process and all its descendants
killtree() {
  local _pid=$1
  local _children=$(pgrep -P $_pid)

  for child in $_children; do
    killtree $child
  done

  if kill -0 $_pid 2>/dev/null; then
    echo "Killing PID $_pid"
    kill -9 $_pid 2>/dev/null
  fi
}

# Cleanup function to kill all PIDs in the array
cleanup() {
  echo "Stopping all background processes..."

  for pid in "${pids[@]}"; do
    killtree "$pid"
  done
}

trap cleanup EXIT SIGINT SIGTERM

wait
