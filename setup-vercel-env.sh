#!/bin/bash

echo "AIzaSyAnqCXFgqPngmzSWcbIoouyKNIZXY0xyNA" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo "learninggamification-new.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo "learninggamification-new" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "learninggamification-new.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "503011580490" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "1:503011580490:web:98c09eec63aefe0ab2e4b3" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo "https://learninggamification-new-default-rtdb.firebaseio.com" | vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production