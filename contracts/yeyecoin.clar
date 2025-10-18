;; YeyeCoin - A fungible token implementation following SIP-010 standard
;; Author: Anthony
;; Description: YeyeCoin is a decentralized digital currency built on Stacks blockchain

;; Define the fungible token
(define-fungible-token yeyecoin)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INVALID_RECIPIENT (err u102))
(define-constant ERR_MINT_FAILED (err u103))

;; Token metadata
(define-constant TOKEN_NAME "YeyeCoin")
(define-constant TOKEN_SYMBOL "YEYE")
(define-constant TOKEN_DECIMALS u6)
(define-constant TOKEN_URI u"https://yeyecoin.com/metadata.json")

;; Initial supply: 21,000,000 YEYE (with 6 decimals)
(define-constant INITIAL_SUPPLY u21000000000000)

;; Data variables
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://yeyecoin.com/metadata.json"))

;; Initialize contract by minting initial supply to contract owner
(begin
  (try! (ft-mint? yeyecoin INITIAL_SUPPLY CONTRACT_OWNER))
)

;; SIP-010 Standard Functions

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_OWNER_ONLY)
    (asserts! (not (is-eq recipient sender)) ERR_INVALID_RECIPIENT)
    (try! (ft-transfer? yeyecoin amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; Get balance of a principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance yeyecoin who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply yeyecoin))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Extended Functions

;; Mint new tokens (owner only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (try! (ft-mint? yeyecoin amount recipient))
    (ok true)
  )
)

;; Burn tokens
(define-public (burn (amount uint))
  (begin
    (try! (ft-burn? yeyecoin amount tx-sender))
    (ok true)
  )
)

;; Update token URI (owner only)
(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Utility function to send tokens to multiple recipients
(define-public (send-many (recipients (list 200 {to: principal, amount: uint, memo: (optional (buff 34))})))
  (fold check-err
    (map send-token recipients)
    (ok true)
  )
)

(define-private (send-token (recipient {to: principal, amount: uint, memo: (optional (buff 34))}))
  (transfer (get amount recipient) tx-sender (get to recipient) (get memo recipient))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior
    ok-value result
    err-value (err err-value)
  )
)

;; Get contract info
(define-read-only (get-contract-info)
  {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    total-supply: (ft-get-supply yeyecoin),
    contract-owner: CONTRACT_OWNER,
    uri: (var-get token-uri)
  }
)

