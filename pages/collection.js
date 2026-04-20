import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Collection() {
  const { connected } = useWallet()
  const [cards, setCards] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myCards') || '[]')
    setCards(saved)
  }, [])

  const rarityLabel = (r) => r === 3 ? 'Legendary' : r === 2 ? 'Rare' : 'Common'

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:'1px solid #4a1d96'}}>
        <Link href="/" style={{color:'#a855f7',fontSize:'24px',fontWeight:'bold',textDecoration:'none'}}>NFT Arena</Link>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/mint" style={{color:'#fff',textDecoration:'none'}}>Mint</Link>
          <Link href="/collection" style={{color:'#a855f7',textDecoration:'none'}}>Collection</Link>
          <Link href="/battle" style={{color:'#fff',textDecoration:'none'}}>Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'48px 32px'}}>
        <h2 style={{fontSize:'36px',fontWeight:'bold',marginBottom:'8px'}}>My Collection</h2>
        <p style={{color:'#9ca3af',marginBottom:'32px'}}>Your minted NFT cards on Solana devnet</p>

        {!connected && (
          <div style={{background:'#4a1d96',border:'1px solid #7c3aed',borderRadius:'8px',padding:'24px',marginBottom:'32px',textAlign:'center'}}>
            <p style={{marginBottom:'16px'}}>Connect your wallet to view your collection</p>
            <WalletMultiButton />
          </div>
        )}

        {connected && cards.length === 0 && (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <p style={{fontSize:'20px',color:'#9ca3af',marginBottom:'24px'}}>No cards yet! Go mint some.</p>
            <Link href="/mint">
              <button style={{background:'#7c3aed',color:'#fff',padding:'12px 32px',borderRadius:'8px',fontWeight:'bold',border:'none',cursor:'pointer'}}>
                Mint Your First Card
              </button>
            </Link>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'24px'}}>
          {cards.map((card, i) => (
            <div key={i} style={{background:'#111827',border:'1px solid #4a1d96',borderRadius:'12px',padding:'24px'}}>
              <div style={{fontSize:'48px',textAlign:'center',marginBottom:'12px'}}>{card.emoji}</div>
              <h3 style={{fontSize:'20px',fontWeight:'bold',textAlign:'center',marginBottom:'4px'}}>{card.name}</h3>
              <p style={{textAlign:'center',fontSize:'14px',marginBottom:'12px',color:'#d1d5db'}}>{rarityLabel(card.rarity)}</p>
              <div style={{display:'flex',justifyContent:'space-around',marginBottom:'12px'}}>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'#f87171',fontWeight:'bold'}}>{card.attack}</p>
                  <p style={{color:'#6b7280',fontSize:'12px'}}>ATK</p>
                </div>
                <div style={{textAlign:'center'}}>
                  <p style={{color:'#60a5fa',fontWeight:'bold'}}>{card.defense}</p>
                  <p style={{color:'#6b7280',fontSize:'12px'}}>DEF</p>
                </div>
              </div>
              <p style={{fontSize:'11px',color:'#6b7280',wordBreak:'break-all',marginBottom:'8px'}}>{card.pda}</p>
              <button
                onClick={() => window.open('https://explorer.solana.com/tx/' + card.tx + '?cluster=devnet', '_blank')}
                style={{background:'transparent',color:'#a855f7',border:'none',cursor:'pointer',fontSize:'12px',padding:'0'}}
              >
                View on Explorer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
