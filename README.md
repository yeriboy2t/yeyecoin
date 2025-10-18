# YeyeCoin (YEYE) 🪙

A decentralized fungible token built on the Stacks blockchain following the SIP-010 standard.

## 🌟 Overview

YeyeCoin is a fully-featured fungible token smart contract that implements the SIP-010 standard for interoperability with Stacks ecosystem applications. With a maximum supply of 21 million tokens and 6 decimal places, YeyeCoin provides a robust foundation for decentralized applications.

### Key Features

- **SIP-010 Compliant**: Full compatibility with Stacks ecosystem
- **Fixed Supply**: Maximum 21,000,000 YEYE tokens
- **Precision**: 6 decimal places for granular transactions
- **Burn Functionality**: Deflationary mechanism
- **Batch Transfers**: Send to multiple recipients in one transaction
- **Owner Controls**: Minting and metadata management
- **Metadata Support**: Token URI for additional information

## 📊 Token Specifications

| Property | Value |
|----------|--------|
| **Name** | YeyeCoin |
| **Symbol** | YEYE |
| **Decimals** | 6 |
| **Total Supply** | 21,000,000 YEYE |
| **Initial Supply** | 21,000,000 YEYE (minted to contract owner) |
| **Standard** | SIP-010 |

## 🚀 Quick Start

### Prerequisites

- [Clarinet](https://docs.hiro.so/clarinet/getting-started) (v3.7.0 or later)
- [Node.js](https://nodejs.org/) (for running tests)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/yeyecoin.git
cd yeyecoin
```

2. Install dependencies:
```bash
npm install
```

3. Check contract syntax:
```bash
clarinet check
```

4. Run tests:
```bash
npm test
```

## 🔧 Development

### Project Structure

```
yeyecoin/
├── contracts/
│   └── yeyecoin.clar          # Main smart contract
├── tests/
│   └── yeyecoin.test.ts       # TypeScript tests
├── settings/
│   ├── Devnet.toml           # Development network settings
│   ├── Testnet.toml          # Testnet settings
│   └── Mainnet.toml          # Mainnet settings
├── Clarinet.toml             # Project configuration
└── README.md                 # This file
```

### Contract Functions

#### SIP-010 Standard Functions

- `transfer(amount, sender, recipient, memo)` - Transfer tokens between accounts
- `get-name()` - Returns token name
- `get-symbol()` - Returns token symbol  
- `get-decimals()` - Returns decimal precision
- `get-balance(who)` - Returns balance of specified principal
- `get-total-supply()` - Returns total token supply
- `get-token-uri()` - Returns metadata URI

#### Extended Functions

- `mint(amount, recipient)` - Mint new tokens (owner only)
- `burn(amount)` - Burn tokens from sender's balance
- `send-many(recipients)` - Send tokens to multiple recipients
- `set-token-uri(new-uri)` - Update metadata URI (owner only)
- `get-contract-info()` - Returns comprehensive contract information

### Testing

Run the test suite:
```bash
npm test
```

Run specific tests:
```bash
npm test -- --reporter=verbose
```

### Deployment

#### Local Development
```bash
clarinet console
```

#### Testnet Deployment
```bash
clarinet deploy --testnet
```

#### Mainnet Deployment
```bash
clarinet deploy --mainnet
```

## 📖 Usage Examples

### Basic Transfer
```clarity
(contract-call? .yeyecoin transfer u1000000 tx-sender 'SP1234567890ABCDEF (some 0x48656c6c6f))
```

### Check Balance
```clarity
(contract-call? .yeyecoin get-balance 'SP1234567890ABCDEF)
```

### Batch Transfer
```clarity
(contract-call? .yeyecoin send-many 
  (list 
    {to: 'SP1111111111111111111, amount: u1000000, memo: none}
    {to: 'SP2222222222222222222, amount: u2000000, memo: none}
  )
)
```

### Burn Tokens
```clarity
(contract-call? .yeyecoin burn u500000)
```

## 🔒 Security

- **Owner-only functions**: Minting and URI updates restricted to contract owner
- **Input validation**: All functions include comprehensive checks
- **Standard compliance**: Follows established SIP-010 patterns
- **Error handling**: Descriptive error codes for debugging

### Error Codes

| Code | Description |
|------|-------------|
| `u100` | Owner-only function called by non-owner |
| `u101` | Insufficient balance for operation |
| `u102` | Invalid recipient (cannot send to self) |
| `u103` | Mint operation failed |

## 🧪 Testing

The project includes comprehensive tests covering:

- Token transfers
- Balance queries
- Minting and burning
- Batch operations
- Error conditions
- Edge cases

Run tests with coverage:
```bash
npm run test:coverage
```

## 📚 API Reference

### Read-Only Functions

#### `get-name()`
Returns the token name.
- **Returns**: `(response string-ascii uint)`

#### `get-symbol()`  
Returns the token symbol.
- **Returns**: `(response string-ascii uint)`

#### `get-decimals()`
Returns the number of decimal places.
- **Returns**: `(response uint uint)`

#### `get-balance(who: principal)`
Returns the token balance of a principal.
- **Parameters**: `who` - The principal to query
- **Returns**: `(response uint uint)`

#### `get-total-supply()`
Returns the total supply of tokens.
- **Returns**: `(response uint uint)`

#### `get-token-uri()`
Returns the metadata URI.
- **Returns**: `(response (optional string-utf8) uint)`

#### `get-contract-info()`
Returns comprehensive contract information.
- **Returns**: Contract metadata object

### Public Functions

#### `transfer(amount: uint, sender: principal, recipient: principal, memo: optional buff)`
Transfer tokens from sender to recipient.
- **Parameters**: 
  - `amount` - Number of tokens to transfer
  - `sender` - Source principal (must be tx-sender)
  - `recipient` - Destination principal
  - `memo` - Optional transaction memo
- **Returns**: `(response bool uint)`

#### `mint(amount: uint, recipient: principal)`
Mint new tokens (owner only).
- **Parameters**:
  - `amount` - Number of tokens to mint  
  - `recipient` - Principal to receive tokens
- **Returns**: `(response bool uint)`

#### `burn(amount: uint)`
Burn tokens from sender's balance.
- **Parameters**: `amount` - Number of tokens to burn
- **Returns**: `(response bool uint)`

#### `send-many(recipients: list)`
Send tokens to multiple recipients in one transaction.
- **Parameters**: `recipients` - List of recipient objects
- **Returns**: `(response bool uint)`

#### `set-token-uri(new-uri: optional string-utf8)`
Update the token metadata URI (owner only).
- **Parameters**: `new-uri` - New metadata URI
- **Returns**: `(response bool uint)`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Check contract syntax (`clarinet check`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This smart contract is provided as-is. Please conduct thorough testing and auditing before using in production. The authors are not responsible for any losses incurred through the use of this contract.

## 🔗 Links

- [Stacks Documentation](https://docs.stacks.co/)
- [SIP-010 Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Clarity Language Reference](https://docs.stacks.co/clarity)

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Join the Stacks Discord community
- Check the documentation

---

Built with ❤️ on Stacks blockchain
