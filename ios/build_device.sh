#!/bin/bash

echo "Building for physical device..."

# Clean build
echo "Cleaning build..."
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/wallpe-*

# Build for device
echo "Building for device..."
xcodebuild -workspace wallpe.xcworkspace \
           -scheme wallpe \
           -configuration Release \
           -destination generic/platform=iOS \
           -derivedDataPath ~/Library/Developer/Xcode/DerivedData/wallpe-device \
           clean build

echo "Build completed!" 