import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const PROGRAM_ID = new web3.PublicKey('2UKxt5rLyEcDP1TjoXnt78o97D13Xqc9oxqnEu4eBrCs')

const OPPONENTS = [
  { name: 'Dark Knight', attack: 80, defense: 70, emoji: '🗡️' },
  { name: 'Sea Serpent', attack: 90, defense: 55, emoji: '🐍' },
  { name: 'Thunder God', attack: 95, defense: 65, emoji: '⚡' },
]

export default function Battle() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [battling, setBattling] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myCards') || '[]')
    setCards(saved)
  }, [])

  const battle = async (opponent) => {
    if (!selected) return
    setBattling(true)
    setResult(null)
    try {
      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
      const idl = await fetch('/idl.json').then(r => r.json())
      const program = new Program(idl, PROGRAM_ID, provider)
      const [playerCardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(selected.name)],
        PROGRAM_ID
      )
      const [opponentCardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(opponent.name)],
        PROGRAM_ID
      )
      await program.methods.battle()
        .accounts({ playerCard: playerCardPDA, opponentCard: opponentCardPDA, player: wallet.publicKey })
        .rpc()
    } catch (err) {
      console.log('On-chain battle failed, using local resolution')
    }
    const playerPower = selected.attack + selected.defense
    const opponentPower = opponent.attack + opponent.defense
    const winner = playerPower >= opponentPower ? selected.name : opponent.name
    setResult('🏆 ' + winner + ' wins the battle!')
    setBattling(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:'1px solid #4a1d96'}}>
        <Link href="/" style={{color:'#a855f7',fontSize:'24px',fontWeight:'bold',textDecoration:'none'}}>NFT Arena</Link>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/mint" style={{color:'#fff',textDecoration:'none'}}>Mint</Link>
          <Link href="/collection" style={{color:'#fff',textDecoration:'none'}}>Collection</Link>
          <Link href="/battle" style={{color:'#a855f7',textDecoration:'none'}}>Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'48px 32px'}}>
        <h2 style={{fontSize:'36px',fontWeight:'bold',marginBottom:'8px'}}>Battle Arena</h2>
        <p style={{color:'#9ca3af',marginBottom:'32px'}}>Select your card and challenge an opponent</p>

        {result && (
          <div style={{background:'#14532d',border:'1px solid #16a34a',borderRadius:'8px',padding:'16px',marginBottom:'24px',textAlign:'center',fontSize:'20px',fontWeight:'bold'}}>
            {result}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px'}}>
          <div>
            <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'16px',color:'#a855f7'}}>Your Cards</h3>
            {cards.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',border:'1px solid #4a1d96',borderRadius:'8px'}}>
                <p style={{color:'#9ca3af',marginBottom:'16px'}}>No cards! Mint some first.</p>
                <Link href="/mint">
                  <button style={{background:'#7c3aed',color:'#fff',padding:'8px 24px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
                    Mint Cards
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {cards.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => setSelected(card)}
                    style={{padding:'16px',borderRadius:'8px',border: selected && selected.name === card.name ? '2px solid #a855f7' : '1px solid #374151',background: selected && selected.name === card.name ? '#4a1d96' : '#111827',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px'}}
                  >
                    <span style={{fontSize:'32px'}}>{card.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:'bold'}}>{card.name}</p>
                      <p style={{fontSize:'14px',color:'#9ca3af'}}>ATK {card.attack} | DEF {card.defense}</p>
                    </div>
                    {selected && selected.name === card.name && (
                      <span style={{color:'#a855f7',fontWeight:'bold'}}>Selected</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'16px',color:'#ef4444'}}>Opponents</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {OPPONENTS.map((opp, i) => (
                <div key={i} style={{padding:'16px',borderRadius:'8px',border:'1px solid #374151',background:'#111827',display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{fontSize:'32px'}}>{opp.emoji}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:'bold'}}>{opp.name}</p>
                    <p style={{fontSize:'14px',color:'#9ca3af'}}>ATK {opp.attack} | DEF {opp.defense}</p>
                  </div>
                  <button
                    onClick={() => battle(opp)}
                    disabled={!selected || battling}
                    style={{background: selected && !battling ? '#dc2626' : '#374151',color:'#fff',padding:'8px 16px',borderRadius:'8px',fontWeight:'bold',border:'none',cursor: selected && !battling ? 'pointer' : 'not-allowed'}}
                  >
                    {battling ? '...' : 'Fight!'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
