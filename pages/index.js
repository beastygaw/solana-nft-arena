import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-purple-900">
        <h1 className="text-2xl font-bold text-purple-400">⚔️ NFT Arena</h1>
        <div className="flex gap-6 items-center">
          <Link href="/mint" className="hover:text-purple-400">Mint</Link>
          <Link href="/collection" className="hover:text-purple-400">Collection</Link>
          <Link href="/battle" className="hover:text-purple-400">Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h2 className="text-6xl font-bold mb-4">
          Forge Your <span className="text-purple-400">Legend</span>
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          Mint NFT cards on Solana, build your deck, and battle players worldwide.
          Every card is unique and owned by you on-chain.
        </p>

        {connected ? (
          <div className="flex gap-4">
            <Link href="/mint">
              <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg text-lg font-bold">
                🎴 Mint Cards
              </button>
            </Link>
            <Link href="/battle">
              <button className="border border-purple-600 hover:bg-purple-900 px-8 py-3 rounded-lg text-lg font-bold">
                ⚔️ Battle Now
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 mb-4">Connect your wallet to start playing</p>
            <WalletMultiButton />
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-16 mt-16">
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">10K+</p>
            <p className="text-gray-400">Cards Minted</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-400">50K+</p>
            <p className="text-gray-400">Battles Fought</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">5K+</p>
            <p className="text-gray-400">Players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
