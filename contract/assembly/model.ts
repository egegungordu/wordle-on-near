import { storage, u128, Context, ContractPromiseBatch, logging, PersistentUnorderedMap, PersistentSet, PersistentVector, RNG } from "near-sdk-as";

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
        //this.maxGameTime = 1 * 10 * 1000000000
        this.totalBid = totalBid
        this.turn = true
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

    private assertGameOver(): void {
        assert(!this.gameOver, 'The game is already over')
    }

    private assertTimeUp(): void {
        assert(Context.blockTimestamp - this.timestamp > this.maxGameTime, 'The game has not timed out yet')
    }

    finish(): void {
        this.assertGameOver()
        this.assertTimeUp()
        this.endGame(false, false)
    }

    // theres a bug somewhere
    selectWord(): string {
        const wordList = storage.getSome<string>('candidateWords').split(',')
        if(this.similarityBoard.length == 0) {
            const rng = new RNG<u32>(1, wordList.length)
            return wordList.at(rng.next())
        }

        let candidateWords = new Array<string>() 
        for(let i = 0; i < wordList.length; i++) {
            const candidateWord = wordList[i]
            let doesFit = true
            for(let j = 0; j < this.similarityBoard.length; j++) {
                let candidateWordChecked = candidateWord
                const oldSimilarity = this.similarityBoard.at(j)
                const oldWord = this.board.at(j)
                let doBreak = false
                for(let k = 0; k < candidateWord.length; k++) {
                    const oldChar = oldWord.charAt(k)
                    const simChar = oldSimilarity.charAt(k)
                    const canChar = candidateWordChecked.charAt(k)
                    if(oldChar == canChar && simChar != 'g') {
                        doesFit = false
                        doBreak = true
                        break;
                    }
                    if(simChar == "g") {
                        if(oldChar != canChar){
                            doesFit = false
                            doBreak = true
                            break;
                        } else {
                            candidateWordChecked = candidateWordChecked.substring(0, k) + '!' + candidateWordChecked.substring(k+1)
                        }
                    } 
                }
                if(doBreak) {
                    break
                }
                for(let k = 0; k < candidateWord.length; k++) {
                    const oldChar = oldWord.charAt(k)
                    const simChar = oldSimilarity.charAt(k)
                    const canChar = candidateWordChecked.charAt(k)
                    if (simChar == "y") {
                        if(!candidateWordChecked.includes(oldChar) || oldChar == canChar){
                            doesFit = false
                            break
                        } else {
                            const similarIndex = candidateWordChecked.indexOf(oldChar)
                            candidateWordChecked = candidateWordChecked.substring(0, similarIndex) + '!' + candidateWordChecked.substring(similarIndex+1)
                        }
                    } else if (simChar == "b" && candidateWordChecked.includes(oldChar)) {
                        doesFit = false
                        break
                    }
                }
            }
            if(doesFit) {
                candidateWords.push(candidateWord)
            }
        }
        const rng = new RNG<u32>(1, candidateWords.length)
        storage.set<string>('candidateWords', candidateWords.join(','))
        return candidateWords.at(rng.next())
    }

    play(word: string): void {
        const accountId = Context.sender
        const isPlayer1 = accountId == this.player1
        const isPlayer2 = accountId == this.player2
        this.assertGameOver()
        this.assertWordValid(word)
        if (this.turn) {
            assert(isPlayer1, 'It is not your turn')
        } else {
            assert(isPlayer2, 'It is not your turn')
        }
        this.checkSimilarity(word)
    }

    private calculateSimilarity(word1: string, word2: string): string {
        let similarity = new Array<string>(word1.length).fill('b')
        for(let i = 0; i < word1.length; i++) {
            const char1 = word1.charAt(i)
            const char2 = word2.charAt(i)
            if(char1 == char2) {
                similarity[i] = 'g'
                word2 = word2.substring(0, i) + '!' + word2.substring(i+1)
            } 
        }
        for(let i = 0; i < word1.length; i++) {
            const char1 = word1.charAt(i)
            if(word2.includes(char1) && similarity[i] != 'g') {
                similarity[i] = 'y'
                const similarIndex = word2.indexOf(char1)
                word2 = word2.substring(0, similarIndex) + '!' + word2.substring(similarIndex+1)
            }
        }
        return similarity.join('')
    }

    private checkSimilarity(word: string): void {
        const words = storage.getSome<string>('words')
        const existsInWordList = words.includes(word)
        const comparedWord = this.selectWord()
        logging.log('compared word was ' + comparedWord)
        if(existsInWordList) {
            const similarity = this.calculateSimilarity(word, comparedWord)
            this.similarityBoard.push(similarity)
            this.board.push(word)
            this.currentRow += 1
            this.turn = !this.turn
            this.evaluateGame() 
        } else {
            this.retries += 1
            if(this.retries > this.maxRetries) {
                this.turn = !this.turn
                this.retries = 0
            }
        }
    }

    private endGame(hasWinner: boolean, stolen: boolean): void {
        // 2% reserved for the contract itself
        const finalAmount = u128.muldiv(this.totalBid, u128.from(98), u128.from(100))
        if(!stolen){
            const accountId = Context.sender
            ContractPromiseBatch.create(accountId).transfer(finalAmount)
            this.winner = accountId
        }
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
            this.turn = !this.turn
            this.currentRow -= 1
            this.endGame(allGreen, true)
        }
    }

}