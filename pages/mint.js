import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import Link from 'next/link';
import { useState } from 'react';

const PROGRAM_ID = new web3.PublicKey('2UKxt5rLyEcDP1TjoXnt78o97D13Xqc9oxqnEu4eBrCs');

const CARDS = [
  { name: 'Dragon Warrior', attack: 85, defense: 60, rarity: 3, emoji: '🐉', color: 'from-red-900 to-orange-900' },
  { name: 'Ice Phoenix', attack: 70, defense: 90, rarity: 2, emoji: '🦅', color: 'from-blue-900 to-cyan-900' },
  { name: 'Shadow Wolf', attack: 95, defense: 45, rarity: 3, emoji: '🐺', color: 'from-gray-900 to-purple-900' },
  { name: 'Storm Eagle', attack: 75, defense: 75, rarity: 2, emoji: '⚡', color: 'from-yellow-900 to-orange-900' },
  { name: 'Earth Golem', attack: 50, defense: 99, rarity: 1, emoji: '🪨', color: 'from-green-900 to-yellow-900' },
  { name: 'Fire Sprite', attack: 88, defense: 40, rarity: 2, emoji: '🔥', color: 'from-red-900 to-yellow-900' },
];

export default function Mint() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [minting, setMinting] = useState(false);
  const [mintedCard, setMintedCard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rarityLabel = (r: number) => r === 3 ? '🟡 Legendary' : r === 2 ? '🔵 Rare' : '⚪ Common';

  const mintCard = async (card: typeof CARDS[0]) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first!');
      return;
    }

    setMinting(true);
    setError(null);
    setMintedCard(null);

    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      
      const mintKeypair = web3.Keypair.generate();

      const [cardPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('card'), wallet.publicKey.toBuffer(), Buffer.from(card.name)],
        PROGRAM_ID
      );

      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );

      const idl = await fetch('/idl.json').then(r => r.json());
      const program = new Program(idl, PROGRAM_ID, provider);

      const tx = await program.methods
        .mintCard(card.name, card.attack, card.defense, card.rarity, `https://nft-arena.io/cards/${card.name.toLowerCase().replace(' ', '-')}`)
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
        .rpc();

      setMintedCard(`${card.emoji} ${card.name} minted! TX: ${tx.slice(0, 20)}...`);

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('myCards') || '[]');
      existing.push({ ...card, pda: cardPDA.toString(), tx });
      localStorage.setItem('myCards', JSON.stringify(existing));

    } catch (err: any) {
      setError(err.message || 'Minting failed');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-purple-900">
        <Link href="/" className="text-2xl font-bold text-purple-400">⚔️ NFT Arena</Link>
        <div className="flex gap-6 items-center">
          <Link href="/mint" className="text-purple-400">Mint</Link>
          <Link href="/collection" className="hover:text-purple-400">Collection</Link>
          <Link href="/battle" className="hover:text-purple-400">Battle</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-2">🎴 Mint Your Cards</h2>
        <p className="text-gray-400 mb-8">Choose a card to mint as an NFT on Solana devnet</p>

        {!wallet.connected && (
          <div className="bg-purple-900 border border-purple-600 rounded-lg p-6 mb-8 text-center">
            <p className="mb-4">Connect your Phantom wallet to mint cards</p>
            <WalletMultiButton />
          </div>
        )}

        {mintedCard && (
          <div className="bg-green-900 border border-green-500 rounded-lg p-4 mb-6">
            ✅ {mintedCard}
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-6">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <div key={card.name} className={`bg-gradient-to-br ${card.color} rounded-xl p-6 border border-purple-800`}>
              <div className="text-6xl text-center mb-4">{card.emoji}</div>
              <h3 className="text-xl font-bold text-center mb-2">{card.name}</h3>
              <p className="text-center text-sm mb-4">{rarityLabel(card.rarity)}</p>
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <p className="text-red-400 font-bold text-lg">{card.attack}</p>
                  <p className="text-gray-400 text-xs">ATK</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 font-bold text-lg">{card.defense}</p>
                  <p className="text-gray-400 text-xs">DEF</p>
                </div>
              </div>
              <button
                onClick={() => mintCard(card)}
                disabled={!wallet.connected || minting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-2 rounded-lg font-bold transition"
              >
                {minting ? '⏳ Minting...' : '✨ Mint Card'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
