#!/bin/bash

echo "Cleaning up Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "Running Next.js build..."
npm run build

echo "Build completed!"
