#!/bin/bash
set -e

echo "=== Starting DataPlug.ng ==="
echo "CWD: $(pwd)"
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-10000}"

# Create necessary directories
mkdir -p db
mkdir -p uploads/payment_proofs

# Start the server
exec node .next/standalone/server.js
