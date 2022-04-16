import { Context, logging, storage, PersistentUnorderedMap, u128, ContractPromiseBatch } from 'near-sdk-as'
import { Game, TopBidderList, Tuple } from './model'

const bidders = new PersistentUnorderedMap<string, u128>('bidders')
const topBidderSize = 10

export function updateTopBidders(bidder: string, amount: u128): number {
  const topBidders = storage.getSome<TopBidderList>("topBidders")
  topBidders.add(bidder, amount)
  if (topBidders.getLength() > topBidderSize) {
    topBidders.removeLast()
  }
  return topBidders.getLength()
}

export function getTopBidders(): Array<Tuple<string,u128>> {
  const topBidders = storage.getSome<TopBidderList>("topBidders")
  return topBidders.getArray()
}

export function getTotalBidders(): number {
  return bidders.length
}

export function placeBid(): void {
  const accountId = Context.sender
  const bid = Context.attachedDeposit
  const game = storage.getSome<Game>("game")
  assert(game.gameOver, 'Bidding is not allowed while the game is in progress')
  assert(!bidders.contains(accountId), 'You already placed a bid')
  bidders.set(accountId, bid)
  updateTopBidders(accountId, bid)
  logging.log(`${accountId} placed a bid of ${bid}`)
} 

export function increaseBid(): void {
  const accountId = Context.sender
  const bidIncrease = Context.attachedDeposit
  const game = storage.getSome<Game>("game")
  assert(game.gameOver, 'Bidding is not allowed while the game is in progress')
  assert(bidders.contains(accountId), 'You must bid before increasing your bid')
  assert(bidIncrease > u128.from(0), 'You must increase your bid more than 0')
  const oldBid = bidders.getSome(accountId)
  const newBid = u128.add(oldBid, bidIncrease)
  bidders.set(accountId, newBid)
  updateTopBidders(accountId, newBid)
  logging.log(`Increased bid for ${accountId} to ${newBid} from ${oldBid}`)
}

export function resetStorage(): void {
  storage.delete("owner")
  storage.delete("topBidders")
  storage.delete("game")
  bidders.clear()
}

export function playGame(word: string): void {
  const accountId = Context.sender
  // TODO: players can be stored as a primitive to reduce gas usage
  const game = storage.getSome<Game>("game")
  assert(game.player1 == accountId || game.player2 == accountId, 'You must be a player to play')
  game.play(word)
  storage.set<Game>("game", game)
  logging.log(`${accountId} played ${word}`)
}

export function postSimilarity(similarity: string): void {
  const accountId = Context.sender
  assert(accountId == storage.getSome<string>("owner"), 'You must be the owner to evaluate words')
  const game = storage.getSome<Game>("game")
  game.checkSimilarity(similarity)
  storage.set<Game>("game", game)
  logging.log(`${accountId} evaluated ${similarity}`)
}

export function finishGame(): void {
  const accountId = Context.sender
  assert(accountId == storage.getSome<string>("owner"), 'You must be the owner to finish the game')
  const game = storage.getSome<Game>("game")
  game.finish()
  storage.set<Game>("game", game)
  logging.log(`${accountId} closed the game with a draw for timeout`)
}

export function getBid(accountId: string): u128 | null {
  return bidders.get(accountId)
}

function refundLosingBids(): void {
  while(bidders.length > 2) {
    const entry = bidders.pop()
    const bidder = entry.key
    const amount = entry.value
    ContractPromiseBatch.create(bidder).transfer(amount)
  }
}

export function startGame(): void {
  const accountId = Context.sender
  assert(accountId == storage.get<string>("owner"), 'You must be the owner to start the game')
  assert(bidders.length > 1, 'You must have at least 2 players to start the game')
  const topBidders = storage.getSome<TopBidderList>("topBidders")
  const topBiddersArray = topBidders.getArray()
  const player1 = topBiddersArray[0].first
  const player2 = topBiddersArray[1].first
  const totalBid = u128.add(topBiddersArray[0].second, topBiddersArray[1].second)
  const game = new Game(player1, player2, totalBid)
  storage.set<Game>("game", game)
  topBidders.clear()
  refundLosingBids()
  bidders.clear()
  logging.log(`Game started between ${player1} and ${player2} wagering ${totalBid}`)
}

// TODO: a timeout function that can only called by the players
// for when the game is halted somehow

export function getGame(): Game {
  return storage.getSome<Game>("game")
}

export function getOwner(): string {
  let owner = storage.getSome<string>("owner")
  return owner
}

export function initContract(): void {
  assert(!storage.contains("owner"), "Owner exists")
  logging.log(`Owner set as ${Context.sender}`)
  storage.set<string>("owner", Context.sender)
  storage.set<TopBidderList>("topBidders", new TopBidderList())
  const genesisGame = new Game("", "", u128.from(0))
  genesisGame.gameOver = true
  storage.set<Game>("game", genesisGame)
}

