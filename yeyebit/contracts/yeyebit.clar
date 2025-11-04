;; yeyebit SIP-010 fungible token implementation
(impl-trait .trait-sip010.sip-010-ft-trait)

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)
(define-constant ERR-INVALID-AMOUNT u102)

(define-constant NAME "Yeyebit")
(define-constant SYMBOL "YBT")
(define-constant DECIMALS u6)
(define-constant TOKEN-URI (some u"https://example.com/metadata/yeyebit.json"))

(define-data-var total-supply uint u0)
(define-map balances { account: principal } { balance: uint })

(define-read-only (get-name)
  (ok NAME))

(define-read-only (get-symbol)
  (ok SYMBOL))

(define-read-only (get-decimals)
  (ok DECIMALS))

(define-read-only (get-token-uri)
  (ok TOKEN-URI))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-balance (who principal))
  (ok (default-to u0 (get balance (map-get? balances { account: who })))))

(define-private (sub-balance (who principal) (amount uint))
  (let ((current (default-to u0 (get balance (map-get? balances { account: who })))))
    (if (< current amount)
        (err ERR-INSUFFICIENT-BALANCE)
        (begin
          (if (is-eq (- current amount) u0)
              (map-delete balances { account: who })
              (map-set balances { account: who } { balance: (- current amount) }))
          (ok true)))))

(define-private (add-balance (who principal) (amount uint))
  (let ((current (default-to u0 (get balance (map-get? balances { account: who })))))
    (map-set balances { account: who } { balance: (+ current amount) })
    (ok true)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (if (or (is-eq amount u0) (is-eq sender recipient))
        (err ERR-INVALID-AMOUNT)
        (if (is-eq tx-sender sender)
            (match (sub-balance sender amount)
              ok-val (let ((r (add-balance recipient amount)))
                        (ok true))
              err-val (err err-val))
            (err ERR-NOT-AUTHORIZED)))))
