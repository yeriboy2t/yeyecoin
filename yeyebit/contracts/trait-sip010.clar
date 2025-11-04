(define-trait sip-010-ft-trait
  (
    ;; Transfers tokens from sender to recipient with optional memo
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    ;; Token name
    (get-name () (response (string-ascii 32) uint))
    ;; Token symbol (ticker)
    (get-symbol () (response (string-ascii 32) uint))
    ;; Number of decimals
    (get-decimals () (response uint uint))
    ;; Balance of a principal
    (get-balance (principal) (response uint uint))
    ;; Total supply of the token
    (get-total-supply () (response uint uint))
    ;; Optional token metadata URI
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)