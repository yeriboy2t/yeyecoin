import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "yeyecoin";
const INITIAL_SUPPLY = 21000000000000; // 21M YEYE with 6 decimals

describe("YeyeCoin Token Tests", () => {
  beforeEach(() => {
    // Fresh simnet state for each test
  });

  describe("Contract Initialization", () => {
    it("should initialize with correct metadata", () => {
      const { result: name } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-name", [], deployer);
      expect(name).toBeOk(Cl.stringAscii("YeyeCoin"));

      const { result: symbol } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-symbol", [], deployer);
      expect(symbol).toBeOk(Cl.stringAscii("YEYE"));

      const { result: decimals } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-decimals", [], deployer);
      expect(decimals).toBeOk(Cl.uint(6));

      const { result: totalSupply } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(totalSupply).toBeOk(Cl.uint(INITIAL_SUPPLY));
    });

    it("should mint initial supply to deployer", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [Cl.principal(deployer)], deployer);
      expect(result).toBeOk(Cl.uint(INITIAL_SUPPLY));
    });

    it("should have correct token URI", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-uri", [], deployer);
      expect(result).toBeOk(Cl.some(Cl.stringUtf8("https://yeyecoin.com/metadata.json")));
    });

    it("should return complete contract info", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-info", [], deployer);
      expect(result).toBeTuple({
        name: Cl.stringAscii("YeyeCoin"),
        symbol: Cl.stringAscii("YEYE"),
        decimals: Cl.uint(6),
        "total-supply": Cl.uint(INITIAL_SUPPLY),
        "contract-owner": Cl.principal(deployer),
        uri: Cl.some(Cl.stringUtf8("https://yeyecoin.com/metadata.json"))
      });
    });
  });

  describe("Token Transfers", () => {
    it("should transfer tokens successfully", () => {
      const transferAmount = 1000000; // 1 YEYE
      
      // Transfer from deployer to wallet1
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check balances
      const { result: senderBalance } = simnet.callReadOnlyFn(
        CONTRACT_NAME, 
        "get-balance", 
        [Cl.principal(deployer)], 
        deployer
      );
      expect(senderBalance).toBeOk(Cl.uint(INITIAL_SUPPLY - transferAmount));

      const { result: recipientBalance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(recipientBalance).toBeOk(Cl.uint(transferAmount));
    });

    it("should fail when sender is not tx-sender", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(1000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        deployer // deployer trying to send from wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY
    });

    it("should fail when transferring to self", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(1000), Cl.principal(deployer), Cl.principal(deployer), Cl.none()],
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_RECIPIENT
    });

    it("should handle memo in transfers", () => {
      const memo = Cl.bufferFromHex("48656c6c6f"); // "Hello" in hex
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(1000), Cl.principal(deployer), Cl.principal(wallet1), Cl.some(memo)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Minting", () => {
    it("should allow owner to mint tokens", () => {
      const mintAmount = 1000000;
      
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.uint(mintAmount), Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check recipient balance
      const { result: balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance).toBeOk(Cl.uint(mintAmount));

      // Check total supply increased
      const { result: totalSupply } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-supply",
        [],
        deployer
      );
      expect(totalSupply).toBeOk(Cl.uint(INITIAL_SUPPLY + mintAmount));
    });

    it("should fail when non-owner tries to mint", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [Cl.uint(1000), Cl.principal(wallet2)],
        wallet1 // non-owner trying to mint
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY
    });
  });

  describe("Burning", () => {
    it("should allow users to burn their tokens", () => {
      const burnAmount = 1000000;
      
      // First, transfer some tokens to wallet1
      simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(burnAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );

      // Then burn from wallet1
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [Cl.uint(burnAmount)],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check balance is now zero
      const { result: balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance).toBeOk(Cl.uint(0));

      // Check total supply decreased
      const { result: totalSupply } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-supply",
        [],
        deployer
      );
      expect(totalSupply).toBeOk(Cl.uint(INITIAL_SUPPLY - burnAmount));
    });
  });

  describe("Batch Transfers (send-many)", () => {
    it("should send tokens to multiple recipients", () => {
      const recipients = Cl.list([
        Cl.tuple({
          to: Cl.principal(wallet1),
          amount: Cl.uint(500000),
          memo: Cl.none()
        }),
        Cl.tuple({
          to: Cl.principal(wallet2),
          amount: Cl.uint(300000),
          memo: Cl.some(Cl.bufferFromHex("4261746368")) // "Batch" in hex
        })
      ]);

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-many",
        [recipients],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check recipient balances
      const { result: balance1 } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance1).toBeOk(Cl.uint(500000));

      const { result: balance2 } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balance2).toBeOk(Cl.uint(300000));
    });

    it("should fail if any transfer in batch fails", () => {
      const recipients = Cl.list([
        Cl.tuple({
          to: Cl.principal(wallet1),
          amount: Cl.uint(500000),
          memo: Cl.none()
        }),
        Cl.tuple({
          to: Cl.principal(deployer), // Invalid: sending to self
          amount: Cl.uint(300000),
          memo: Cl.none()
        })
      ]);

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-many",
        [recipients],
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR_INVALID_RECIPIENT
    });
  });

  describe("URI Management", () => {
    it("should allow owner to update token URI", () => {
      const newUri = Cl.some(Cl.stringUtf8("https://newuri.com/metadata.json"));
      
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-token-uri",
        [newUri],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check URI was updated
      const { result: uri } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-token-uri",
        [],
        deployer
      );
      expect(uri).toBeOk(newUri);
    });

    it("should fail when non-owner tries to update URI", () => {
      const newUri = Cl.some(Cl.stringUtf8("https://malicious.com/metadata.json"));
      
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-token-uri",
        [newUri],
        wallet1 // non-owner
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY
    });

    it("should allow setting URI to none", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-token-uri",
        [Cl.none()],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      const { result: uri } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-token-uri",
        [],
        deployer
      );
      expect(uri).toBeOk(Cl.none());
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle zero amount transfers", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(0), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should handle large amounts within limits", () => {
      const largeAmount = 10000000000; // 10K YEYE
      
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(largeAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should maintain balance consistency across operations", () => {
      const transferAmount = 1000000;
      
      // Get initial balances
      const { result: initialDeployerBalance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(deployer)],
        deployer
      );
      
      const { result: initialWallet1Balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );

      // Transfer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );

      // Check final balances
      const { result: finalDeployerBalance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(deployer)],
        deployer
      );
      
      const { result: finalWallet1Balance } = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );

      // Verify balance changes
      const initialDeployerAmount = (initialDeployerBalance as any).value.value;
      const finalDeployerAmount = (finalDeployerBalance as any).value.value;
      const initialWallet1Amount = (initialWallet1Balance as any).value.value;
      const finalWallet1Amount = (finalWallet1Balance as any).value.value;

      expect(finalDeployerAmount).toBe(initialDeployerAmount - transferAmount);
      expect(finalWallet1Amount).toBe(initialWallet1Amount + transferAmount);
    });
  });
});
