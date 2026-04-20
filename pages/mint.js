import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import Link from 'next/link'
import { useState } from 'react'

const PROGRAM_ID = new web3.PublicKey('2UKxt5rLyEcDP1TjoXnt78o97D13Xqc9oxqnEu4eBrCs')

const CARDS = [
  { name: 'Dragon Warrior', attack: 85, defense: 60, rarity: 3, emoji: '🐉', bg: '#7f1d1d' },
  { name: 'Ice Phoenix', attack: 70, defense: 90, rarity: 2, emoji: '🦅', bg: '#1e3a5f' },
  { name: 'Shadow Wolf', attack: 95, defense: 45, rarity: 3, emoji: '🐺', bg: '#1a1a2e' },
  { name: 'Storm Eagle', attack: 75, defense: 75, rarity: 2, emoji: '⚡', bg: '#3b2000' },
  { name: 'Earth Golem', attack: 50, defense: 99, rarity: 1, emoji: '🪨', bg: '#14290a' },
  { name: 'Fire Sprite', attack: 88, defense: 40, rarity: 2, emoji: '🔥', bg: '#450a0a' },
]

export default function Mint() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [minting, setMinting] = useState(false)
  const [mintedCard, setMintedCard] = useState(null)
  const [error, setError] = useState(null)

  const rarityLabel = (r) => r === 3 ? 'Legendary' : r === 2 ? 'Rare' : 'Common'

  const mintCard = async (card) => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first!')
      return
    }
    setMinting(true)
    setError(null)
    setMintedCard(null)
    try {
      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
      const mintKeypair = web3.Keypair.generate()
      const [cardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(card.name)],
        PROGRAM_ID
      )
      const tokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, wallet.publicKey)
      const idl = await fetch('/idl.json').then(r => r.json())
      const program = new Program(idl, PROGRAM_ID, provider)
      const tx = await program.methods
        .mintCard(card.name, card.attack, card.defense, card.rarity, 'https://nft-arena.io/cards/' + card.name)
        .accounts({
          cardAccount: cardPDA,
          mint: mintKeypair.publicKey,
          tokenAccount,
          player: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc()
      setMintedCard(card.emoji + ' ' + card.name + ' minted! TX: ' + tx.slice(0, 20) + '...')
      const existing = JSON.parse(localStorage.getItem('myCards') || '[]')
      existing.push({ ...card, pda: cardPDA.toString(), tx })
      localStorage.setItem('myCards', JSON.stringify(existing))
    } catch (err) {
      setError(err.message || 'Minting failed')
    } finally {
      setMinting(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:'1px solid #4a1d96'}}>
        <Link href="/" style={{color:'#a855f7',fontSize:'24px',fontWeight:'bold',textDecoration:'none'}}>NFT Arena</Link>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/mint" style={{color:'#a855f7',textDecoration:'none'}}>Mint</Link>
          <Link href="/collection" style={{color:'#fff',textDecoration:'none'}}>Collection</Link>
          <Link href="/battle" style={{color:'#fff',textDecoration:'none'}}>Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'48px 32px'}}>
        <h2 style={{fontSize:'36px',fontWeight:'bold',marginBottom:'8px'}}>Mint Your Cards</h2>
        <p style={{color:'#9ca3af',marginBottom:'32px'}}>Choose a card to mint as NFT on Solana devnet</p>
        {!wallet.connected && (
          <div style={{background:'#4a1d96',border:'1px solid #7c3aed',borderRadius:'8px',padding:'24px',marginBottom:'32px',textAlign:'center'}}>
            <p style={{marginBottom:'16px'}}>Connect your Phantom wallet to mint cards</p>
            <WalletMultiButton />
          </div>
        )}
        {mintedCard && (
          <div style={{background:'#14532d',border:'1px solid #16a34a',borderRadius:'8px',padding:'16px',marginBottom:'24px'}}>
            {mintedCard}
          </div>
        )}
        {error && (
          <div style={{background:'#7f1d1d',border:'1px solid #dc2626',borderRadius:'8px',padding:'16px',marginBottom:'24px'}}>
            {error}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'24px'}}>
          {CARDS.map((card) => (
            <div key={card.name} style={{background:card.bg,borderRadius:'12px',padding:'24px',border:'1px solid #4a1d96'}}>
              <div style={{fontSize:'64px',textAlign:'center',marginBottom:'16px'}}>{card.emoji}</div>
              <h3 style={{fontSize:'20px',fontWeight:'bold',textAlign:'center',marginBottom:'8px'}}>{card.name}</h3>
              <p style={{textAlign:'center',fontSize:'14px',marginBottom:'16px',color:'#d1d5db'}}>{rarityLabel(card.rarity)}</p>
              <div style={{display:'flex',justifyContent:'space-around',marginBottom:'16px'}}>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'#f87171',fontWeight:'bold',fontSize:'20px'}}>{card.attack}</p>
                  <p style={{color:'#9ca3af',fontSize:'12px'}}>ATK</p>
                </div>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'#60a5fa',fontWeight:'bold',fontSize:'20px'}}>{card.defense}</p>
                  <p style={{color:'#9ca3af',fontSize:'12px'}}>DEF</p>
                </div>
              </div>
              <button
                onClick={() => mintCard(card)}
                disabled={!wallet.connected || minting}
                style={{width:'100%',background: wallet.connected ? '#7c3aed' : '#374151',color:'#fff',padding:'10px',borderRadius:'8px',fontWeight:'bold',border:'none',cursor: wallet.connected ? 'pointer' : 'not-allowed'}}
              >
                {minting ? 'Minting...' : 'Mint Card'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
