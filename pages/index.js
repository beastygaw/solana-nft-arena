import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'

export default function Home() {
  const { connected } = useWallet()

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:'1px solid #4a1d96'}}>
        <h1 style={{color:'#a855f7',fontSize:'24px',fontWeight:'bold'}}>NFT Arena</h1>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/mint" style={{color:'#fff',textDecoration:'none'}}>Mint</Link>
          <Link href="/collection" style={{color:'#fff',textDecoration:'none'}}>Collection</Link>
          <Link href="/battle" style={{color:'#fff',textDecoration:'none'}}>Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',textAlign:'center',padding:'0 16px'}}>
        <h2 style={{fontSize:'48px',fontWeight:'bold',marginBottom:'16px'}}>
          Forge Your <span style={{color:'#a855f7'}}>Legend</span>
        </h2>
        <p style={{fontSize:'20px',color:'#9ca3af',marginBottom:'32px',maxWidth:'600px'}}>
          Mint NFT cards on Solana, build your deck, and battle players worldwide.
        </p>
        {connected ? (
          <div style={{display:'flex',gap:'16px'}}>
            <Link href="/mint">
              <button style={{background:'#7c3aed',color:'#fff',padding:'12px 32px',borderRadius:'8px',fontSize:'18px',fontWeight:'bold',border:'none',cursor:'pointer'}}>
                Mint Cards
              </button>
            </Link>
            <Link href="/battle">
              <button style={{background:'transparent',color:'#fff',padding:'12px 32px',borderRadius:'8px',fontSize:'18px',fontWeight:'bold',border:'1px solid #7c3aed',cursor:'pointer'}}>
                Battle Now
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <p style={{color:'#6b7280',marginBottom:'16px'}}>Connect your wallet to start playing</p>
            <WalletMultiButton />
          </div>
        )}
        <div style={{display:'flex',gap:'64px',marginTop:'64px'}}>
          <div style={{textAlign:'center'}}>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#a855f7'}}>10K+</p>
            <p style={{color:'#9ca3af'}}>Cards Minted</p>
          </div>
          <div style={{textAlign:'center'}}>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#10b981'}}>50K+</p>
            <p style={{color:'#9ca3af'}}>Battles Fought</p>
          </div>
          <div style={{textAlign:'center'}}>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#3b82f6'}}>5K+</p>
            <p style={{color:'#9ca3af'}}>Players</p>
          </div>
        </div>
      </div>
    </div>
  )
}
