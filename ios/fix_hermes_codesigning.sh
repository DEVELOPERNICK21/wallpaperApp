#!/bin/bash

# Fix Hermes framework code signing issues
echo "Fixing Hermes framework code signing..."

# Find the Hermes framework
HERMES_FRAMEWORK_PATH=""
if [ -d "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/hermes.framework" ]; then
    HERMES_FRAMEWORK_PATH="${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/hermes.framework"
elif [ -d "${BUILT_PRODUCTS_DIR}/hermes.framework" ]; then
    HERMES_FRAMEWORK_PATH="${BUILT_PRODUCTS_DIR}/hermes.framework"
fi

if [ -n "$HERMES_FRAMEWORK_PATH" ]; then
    echo "Found Hermes framework at: $HERMES_FRAMEWORK_PATH"
    
    # Remove existing code signature
    codesign --remove-signature "$HERMES_FRAMEWORK_PATH" 2>/dev/null || true
    
    # Re-sign with the correct identity
    if [ -n "$EXPANDED_CODE_SIGN_IDENTITY" ]; then
        echo "Re-signing with identity: $EXPANDED_CODE_SIGN_IDENTITY"
        codesign --force --sign "$EXPANDED_CODE_SIGN_IDENTITY" --preserve-metadata=identifier,entitlements "$HERMES_FRAMEWORK_PATH"
    else
        echo "Re-signing with ad-hoc signature"
        codesign --force --sign - --preserve-metadata=identifier,entitlements "$HERMES_FRAMEWORK_PATH"
    fi
    
    if [ $? -eq 0 ]; then
        echo "Hermes framework code signing fixed successfully"
    else
        echo "Warning: Failed to fix Hermes framework code signing"
        exit 1
    fi
else
    echo "Hermes framework not found, skipping code signing fix"
fi 