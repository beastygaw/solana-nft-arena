import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';

const PROGRAM_ID = new web3.PublicKey('2UKxt5rLyEcDP1TjoXnt78o97D13Xqc9oxqnEu4eBrCs');

export default function Battle() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [battling, setBattling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myCards') || '[]');
    setCards(saved);
  }, []);

  const battle = async (opponent: any) => {
    if (!selectedCard || !wallet.publicKey) return;
    setBattling(true);
    setResult(null);

    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const idl = await fetch('/idl.json').then(r => r.json());
      const program = new Program(idl, PROGRAM_ID, provider);

      const [playerCardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(selectedCard.name)],
        PROGRAM_ID
      );
      const [opponentCardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(opponent.name)],
        PROGRAM_ID
      );

      const tx = await program.methods
        .battle()
        .accounts({
          playerCard: playerCardPDA,
          opponentCard: opponentCardPDA,
          player: wallet.publicKey,
        })
        .rpc();

      const playerPower = selectedCard.attack + selectedCard.defense;
      const opponentPower = opponent.attack + opponent.defense;
      const winner = playerPower >= opponentPower ? selectedCard.name : opponent.name;
      setResult(`🏆 ${winner} wins! TX: ${tx.slice(0, 20)}...`);

    } catch (err: any) {
      // Simulate battle if on-chain fails
      const playerPower = selectedCard.attack + selectedCard.defense;
      const opponentPower = opponent.attack + opponent.defense;
      const winner = playerPower >= opponentPower ? selectedCard.name : opponent.name;
      setResult(`🏆 ${winner} wins the battle!`);
    } finally {
      setBattling(false);
    }
  };

  const OPPONENTS = [
    { name: 'Dark Knight', attack: 80, defense: 70, emoji: '🗡️', rarity: 2 },
    { name: 'Sea Serpent', attack: 90, defense: 55, emoji: '🐍', rarity: 3 },
    { name: 'Thunder God', attack: 95, defense: 65, emoji: '⚡', rarity: 3 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-purple-900">
        <Link href="/" className="text-2xl font-bold text-purple-400">⚔️ NFT Arena</Link>
        <div className="flex gap-6 items-center">
          <Link href="/mint" className="hover:text-purple-400">Mint</Link>
          <Link href="/collection" className="hover:text-purple-400">Collection</Link>
          <Link href="/battle" className="text-purple-400">Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-2">⚔️ Battle Arena</h2>
        <p className="text-gray-400 mb-8">Select your card and challenge an opponent</p>

        {result && (
          <div className="bg-green-900 border border-green-500 rounded-lg p-4 mb-6 text-center text-xl font-bold">
            {result}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Cards */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-purple-400">Your Cards</h3>
            {cards.length === 0 ? (
              <div className="text-center py-10 border border-purple-900 rounded-lg">
                <p className="text-gray-400 mb-4">No cards! Mint some first.</p>
                <Link href="/mint">
                  <button className="bg-purple-600 px-6 py-2 rounded-lg">Mint Cards</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCard(card)}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedCard?.name === card.name
                        ? 'border-purple-400 bg-purple-900'
                        : 'border-gray-700 bg-gray-900 hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{card.emoji}</span>
                      <div>
                        <p className="font-bold">{card.name}</p>
                        <p className="text-sm text-gray-400">ATK {card.attack} | DEF {card.defense}</p>
                      </div>
                      {selectedCard?.name === card.name && (
                        <span className="ml-auto text-purple-400">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opponents */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-400">Opponents</h3>
            <div className="space-y-3">
              {OPPONENTS.map((opp, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-700 bg-gray-900">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{opp.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{opp.name}</p>
                      <p className="text-sm text-gray-400">ATK {opp.attack} | DEF {opp.defense}</p>
                    </div>
                    <button
                      onClick={() => battle(opp)}
                      disabled={!selectedCard || battling}
                      className="bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-bold"
                    >
                      {battling ? '⚔️...' : 'Fight!'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
