# ⚔️ NFT Arena — Solana Smart Contract

## Program ID
2UKxt5rLyEcDP1TjoXnt78o97D13Xqc9oxqnEu4eBrCs
## Network
Solana Devnet

## Framework
Anchor v0.29.0

## Instructions

### mint_card
Mints a new NFT card with on-chain stats.
- **Args:** name, attack, defense, rarity, uri
- **Accounts:** cardAccount (PDA), mint, tokenAccount, player

### battle  
Battles two cards and updates win/loss records on-chain.
- **Args:** none
- **Accounts:** playerCard, opponentCard, player

### get_card_stats
Fetches and logs card stats.
- **Accounts:** cardAccount

## Card Account Structure
```rust
pub struct CardAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub attack: u8,
    pub defense: u8,
    pub rarity: u8,
    pub wins: u32,
    pub losses: u32,
    pub uri: String,
}
```

## Frontend
👉 https://github.com/beastygaw/nft-arena-web
