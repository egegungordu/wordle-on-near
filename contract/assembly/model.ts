import { storage, u128, Context, ContractPromiseBatch, logging } from "near-sdk-as";

@nearBindgen
export class TopBidderList {
    private list: Array<Tuple<string,u128>>;

    constructor() {
        this.list = new Array<Tuple<string,u128>>()
    }

    add(bidder: string, amount: u128): void {
        let exists = false
        for (let i = 0; i < this.list.length; i++) {
            if (this.list.at(i).first == bidder) {
                this.list.at(i).second = amount
                exists = true
                break
            }
        }
        if (!exists) {
            this.list.push(new Tuple<string,u128>(bidder, amount))
        }
        this.list.sort((a, b) => a.second > b.second ? -1 : 1)
        storage.set<TopBidderList>("topBidders", this)
    }

    getLength(): number {
        return this.list.length
    }

    removeLast(): void {
        this.list.pop()
        storage.set<TopBidderList>("topBidders", this)
    }

    clear(): void {
        this.list = new Array<Tuple<string,u128>>()
        storage.set<TopBidderList>("topBidders", this)
    }

    getArray(): Array<Tuple<string,u128>> {
        return this.list
    }
}

@nearBindgen
export class Tuple<T, U> {
    first: T;
    second: U;

    constructor(first: T, second: U) {
        this.first = first
        this.second = second
    }
};

@nearBindgen
export class Game {
    player1: string;
    player2: string;
    private retries: u8;
    private maxRetries: u8;
    winner: string;
    gameOver: boolean;
    timestamp: u64;
    gameOverTimestamp: u64;
    maxGameTime: u64;
    private totalBid: u128;
    private turn: boolean;
    private board: Array<string>;
    private similarityBoard: Array<string>;
    private pendingWord: string;
    private currentRow: u8;
    private wordSize: i32;
    private wordCount: i32;

    constructor(player1: string, player2: string, totalBid: u128) {
        this.player1 = player1
        this.player2 = player2
        this.retries = 0
        this.maxRetries = 2
        this.winner = ''
        this.gameOver = false;
        this.timestamp = Context.blockTimestamp
        this.gameOverTimestamp = 0
        // 10 minutes in nanoseconds
        this.maxGameTime = 10 * 60 * 1000000000
        this.totalBid = totalBid
        this.turn = true
        this.pendingWord = ''
        this.wordSize = 5
        this.wordCount = 7
        this.currentRow = 0
        this.board = new Array<string>()
        this.similarityBoard = new Array<string>()
    }

    private assertWordValid(word: string): void {
        assert(word.length == this.wordSize, `The word must be ${this.wordSize} characters long`)
        // TODO: only english characters
    }

    private assertReady(): void {
        assert(this.pendingWord == '', 'The last pending word was not evaluated')
    }

    private assertSimilarityReady(): void {
        assert(this.pendingWord != '', 'No pending word to evaluate')
    }

    private assertGameOver(): void {
        assert(!this.gameOver, 'The game is already over')
    }

    private assertTimeUp(): void {
        assert(Context.blockTimestamp - this.timestamp > this.maxGameTime, 'The game has not timed out yet')
    }

    finish(): void {
        this.assertGameOver()
        this.assertTimeUp()
        this.endGame(false)
    }

    play(word: string): void {
        const accountId = Context.sender
        const isPlayer1 = accountId == this.player1
        const isPlayer2 = accountId == this.player2
        this.assertGameOver()
        this.assertWordValid(word)
        this.assertReady()
        if (this.turn) {
            assert(isPlayer1, 'It is not your turn')
        } else {
            assert(isPlayer2, 'It is not your turn')
        }
        this.pendingWord = word
    }

    private isInexistent(similarity: string): boolean {
        let allInexistent = true
        for(let i = 0; i < similarity.length; i++) {
            if(similarity.charAt(i) != "i") {
                allInexistent = false
            }
        }
        return allInexistent
    }

    checkSimilarity(similarity: string): void {
        this.assertWordValid(similarity)
        this.assertGameOver()
        this.assertSimilarityReady()
        if(!this.isInexistent(similarity)) {
            this.similarityBoard.push(similarity)
            this.board.push(this.pendingWord)
            this.currentRow += 1
            this.turn = !this.turn
            this.pendingWord = ''
            this.evaluateGame() 
        } else {
            this.retries += 1
            if(this.retries > this.maxRetries) {
                this.turn = !this.turn
                this.retries = 0
            }
            this.pendingWord = ''
        }
    }

    private endGame(hasWinner: boolean): void {
        // 2% reserved for the contract itself
        const finalAmount = u128.muldiv(this.totalBid, u128.from(98), u128.from(100))
        if(hasWinner){
            const isWinnerPlayer1 = this.currentRow % 2 == 1
            this.winner = isWinnerPlayer1 ? this.player1 : this.player2
            ContractPromiseBatch.create(this.winner).transfer(finalAmount)
            logging.log(`${this.winner} won the game with ${finalAmount} yoktoNEAR`)
        } else {
            const refund = u128.div(finalAmount, u128.from(2))
            ContractPromiseBatch.create(this.player1).transfer(refund)
            ContractPromiseBatch.create(this.player2).transfer(refund)
            logging.log(`The game ended in a draw with ${refund} yoktoNEAR each`)
        }
        this.gameOver = true
        this.gameOverTimestamp = Context.blockTimestamp
    }

    private evaluateGame(): void {
        const evaluatedWord = this.similarityBoard.at(this.currentRow-1)
        let allGreen = true
        for(let i = 0; i < evaluatedWord.length; i++) {
            if(evaluatedWord.charAt(i) != "g") {
                allGreen = false
            }
        }
        if(allGreen || (this.currentRow == this.wordCount)) {
            this.endGame(allGreen)
        }
    }

}