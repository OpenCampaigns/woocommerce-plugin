# OpenCampaigns for WooCommerce

Turn your WooCommerce store into an independent publisher on the OpenCampaigns ad network out-of-the-box. 

## About
This self-contained WordPress plugin seamlessly manages merchant identity, auto-generates your dedicated `/.well-known/opencampaigns.json` manifest endpoint with cryptographic Schnorr signatures, and provides UI hooks directly into the core WooCommerce Product Edit pages to enable instant campaign broadcasting to Nostr relays.

## Features
- **Zero PHP Cryptography Footprint**: Utilizes a custom ESBuild JavaScript browser bundler wrapping the core `@opencampaigns/sdk` to execute cryptographic secp256k1 signatures seamlessly in the administrator's browser.
- **Toggle Campaign Export**: Add individual products as exclusive offers into your decentralized affiliate ad pool instantly.
- **Nostr Key Manager**: Safely generate private/public cryptographic identities securely stored inside the WordPress Options table.

## License
MIT
