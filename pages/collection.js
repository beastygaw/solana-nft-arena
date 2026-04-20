import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Collection() {
  const { connected } = useWallet();
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myCards') || '[]');
    setCards(saved);
  }, []);

  const rarityLabel = (r: number) => {
    if (r === 3) return 'Legendary';
    if (r === 2) return 'Rare';
    return 'Common';
  };

  const explorerLink = (tx: string) => {
    return 'https://explorer.solana.com/tx/' + tx + '?cluster=devnet';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-purple-900">
        <Link href="/" className="text-2xl font-bold text-purple-400">NFT Arena</Link>
        <div className="flex gap-6 items-center">
          <Link href="/mint" className="hover:text-purple-400">Mint</Link>
          <Link href="/collection" className="text-purple-400">Collection</Link>
          <Link href="/battle" className="hover:text-purple-400">Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-2">My Collection</h2>
        <p className="text-gray-400 mb-8">Your minted NFT cards on Solana devnet</p>

        {!connected && (
          <div className="bg-purple-900 border border-purple-600 rounded-lg p-6 mb-8 text-center">
            <p className="mb-4">Connect your wallet to view your collection</p>
            <WalletMultiButton />
          </div>
        )}

        {connected && cards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-6">No cards yet! Go mint some.</p>
            <Link href="/mint">
              <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold">
                Mint Your First Card
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-gray-900 border border-purple-800 rounded-xl p-6">
              <div className="text-5xl text-center mb-3">{card.emoji}</div>
              <h3 className="text-xl font-bold text-center mb-1">{card.name}</h3>
              <p className="text-center text-sm mb-3">{rarityLabel(card.rarity)}</p>
              <div className="flex justify-between mb-3">
                <div className="text-center">
                  <p className="text-red-400 font-bold">{card.attack}</p>
                  <p className="text-gray-500 text-xs">ATK</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 font-bold">{card.defense}</p>
                  <p className="text-gray-500 text-xs">DEF</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate mb-1">
                {card.pda}
              </p>
              <button
                onClick={() => window.open(explorerLink(card.tx), '_blank')}
                className="text-xs text-purple-400 hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                View on Explorer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
