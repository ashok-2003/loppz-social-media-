#!/usr/bin/env bash

npm install
npm run build
npx prisma generate
