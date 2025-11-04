# Yeyebit (YBT) – SIP-010 Fungible Token

A Clarity smart contract implementing the SIP-010 fungible token standard for the Yeyebit token.

## Project layout
- `contracts/trait-sip010.clar` – Local copy of the SIP-010 fungible token trait
- `contracts/yeyebit.clar` – Yeyebit token implementation (implements the trait)
- `Clarinet.toml` – Clarinet project configuration
- `tests/` – Place TypeScript tests here (Vitest)

## Requirements
- Clarinet 3.x

## Quick start
```bash
# From this directory
clarinet check
```

## Contract interface
Implements `sip-010-ft-trait`:
- `transfer(amount, sender, recipient, memo)` -> `(response bool uint)`
- `get-name()` -> `(response (string-ascii 32) uint)`
- `get-symbol()` -> `(response (string-ascii 32) uint)`
- `get-decimals()` -> `(response uint uint)`
- `get-balance(principal)` -> `(response uint uint)`
- `get-total-supply()` -> `(response uint uint)`
- `get-token-uri()` -> `(response (optional (string-utf8 256)) uint)`

### Token metadata
- Name: `Yeyebit`
- Symbol: `YBT`
- Decimals: `6`
- Token URI: `https://example.com/metadata/yeyebit.json`

## Local usage in console
```bash
clarinet console
```
Examples (inside console):
```clarity
;; Show decimals
(contract-call? .yeyebit get-decimals)

;; Transfer 100 from wallet_1 to wallet_2 (sender must be tx-sender)
(contract-call? .yeyebit transfer u100 tx-sender 'ST3J2GVMMM2R07ZFBJDWTJEHC3P7VQ2ZHVGP7J8KX none)
```

## Testing
Vitest is configured. Create tests in `tests/` using the Clarinet TS SDK.

## Notes
- This minimal SIP-010 implementation does not include mint/burn helpers.
- Balances/supply are maintained in uints with 6 decimals.
