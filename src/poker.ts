
export const ALL_SUITS = ['D', 'H', 'C', 'S'] as const 
export const ALL_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const

export type Suit = (typeof ALL_SUITS)[number]
export type Rank = (typeof ALL_RANKS)[number]

export const isSuit = (val: string): val is Suit => {
    return ALL_SUITS.includes(val as Suit)
}

export const isRank = (val: string): val is Rank => {
    return ALL_RANKS.includes(val as Rank)
}


export interface Card {
    suit: Suit
    rank: Rank
}

export type Hand = Card[]


function sortCardHelper(a: Card, b: Card): number {
    const bRank = ALL_RANKS.indexOf(b.rank)
    const aRank = ALL_RANKS.indexOf(a.rank)

    if (aRank < bRank) {
        return -1
    }
    if (aRank == bRank) {
        return 0 
    }
    return 1
}

export function toCard(hand: string): Card | undefined {
    if (hand.length != 2) {
        return undefined
    }
    const rank = hand[0].toUpperCase()
    const suit = hand[1].toUpperCase()

    if (!isRank(rank) || !isSuit(suit)) {
        return undefined
    }

    return {
        rank: rank as Rank,
        suit: suit as Suit,
    }
}

export function toHand(hand: string[]): Hand {
    return hand.reduce((acc: Card[], h: string) => {
        const res = toCard(h)
        if (res != undefined) {
            acc.push(res)
        }
        return acc
    }, [])
}


interface RankMap {
    '2': number, '3': number, '4': number, '5': number, '6': number, '7':number,
    '8':number, '9': number, 'T': number, 'J': number, 'Q': number,
    'K': number, 'A': number
}
interface SuitMap {
    'D': number,
    'S': number,
    'C': number,
    'H': number,
}
function rankMap(hand: Hand): RankMap {
    return hand.reduce((acc:RankMap, card: Card) => {
        acc[card.rank] += 1 
        return acc
    }, {'2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, 'T':0, 'J':0,
    'Q':0, 'K':0, 'A':0})
}

function suitMap(hand: Hand): SuitMap {
    return hand.reduce((acc:SuitMap, card: Card) => {
        acc[card.suit] += 1 
        return acc
    }, {'D':0, 'H':0, 'C':0, 'S': 0})
}

function isNKind(hand: Hand, n: number): number {
    return Object.entries(rankMap(hand))
        .reduce((acc, v) => 
            v[1] === n 
            ? Math.max(acc, ALL_RANKS.indexOf(v[0] as Rank)) 
            : acc
        , -1)
}

export function compareFlush(a: number[], b:number[]): number {
    for (let i = 0; i < 5; i++) {
        if (a[i] > b[i]) {
            return 1
        }
        if (a[i] < b[i]) {
            return -1
        } 
    }
    return 0
}


// Calculate Hands
export function isHighCard(hand: Hand, numCards: number): number[] {
    if (numCards >= hand.length) {
        return []
    }
    return hand.sort(sortCardHelper)
                .reverse()
                .slice(0, numCards)
                .map(c => ALL_RANKS.indexOf(c.rank))
}
export function isOnePair(hand: Hand): [number, number, number, number] | null {
    const highestPairIndex = isNKind(hand, 2)
    if (highestPairIndex === -1) {
        return null
    }
    const newHand = hand.filter(c => c.rank !== ALL_RANKS[highestPairIndex] )
    // ensure only 1 pair 
    if (isNKind(newHand, 2) !== -1 || isNKind(newHand, 3) !== -1) {
        return null
    }
    const [first, second, third] = isHighCard(newHand, 3)
    return [highestPairIndex, first, second, third]
}
export function isTwoPair(hand: Hand): [number, number, number] | null {
    let pairs = Object.entries(rankMap(hand))
        .reduce((acc: number[], v) => {
            if (v[1] === 2) {
                acc.push(ALL_RANKS.indexOf(v[0] as Rank))
            }
            return acc 
        }, [])
    if (pairs.length < 2) {
        return null
    }
    pairs = pairs.sort((a,b) => a - b)
                 .reverse()
    
    const highPairIndex = pairs[0]
    const lowPairIndex = pairs[1]
    const highRank = ALL_RANKS[highPairIndex]
    const lowRank = ALL_RANKS[lowPairIndex]
    // need to find remaining high card
    const remainingCards = hand.filter(c => c.rank !== highRank && c.rank !== lowRank)
    const highCard = isHighCard(remainingCards, 1)[0]

    return [highPairIndex, lowPairIndex, highCard]
}
export function isThreeKind(hand: Hand): [number, number, number] | null {
    const threeKindIndex = isNKind(hand, 3)
    // not 3-kind if there is a pair
    if (isNKind(hand, 2) !== -1) {
        return null
    }
    const threeKindRank: Rank = ALL_RANKS[threeKindIndex]

    const filteredList = hand.filter(c => c.rank !== threeKindRank)
                             .sort(sortCardHelper)
                             .reverse()
    const firstHighest = ALL_RANKS.indexOf(filteredList[0].rank)
    const secondHighest = ALL_RANKS.indexOf(filteredList[1].rank) 

    return [threeKindIndex, firstHighest, secondHighest]
}
export function isStraight(hand: Hand): number {
    let ranks = hand.sort(sortCardHelper).map(c => ALL_RANKS.indexOf(c.rank))
    if (ranks.includes(ALL_RANKS.length - 1)) { // allow Ace to act as 1
        ranks = [-1,...ranks]
    }
    let m = -1;
    for (let i = 0; i < ranks.length - 4; i++) {
        if ( ranks[i+1] === ranks[i] + 1 &&
            ranks[i+2] === ranks[i] + 2 &&
            ranks[i+3] === ranks[i] + 3 &&
            ranks[i+4] === ranks[i] + 4 
        ) 
        m = ranks[i+4]
    }
    return m
}
export function isFlush(hand: Hand): number[] {
    const sm = suitMap(hand)
    return Object.entries(sm).reduce((acc: number[], v) => {
        if (v[1] >= 5) {
            const sorted = hand.filter(c => c.suit === v[0])
                            .map(c => ALL_RANKS.indexOf(c.rank))
                            .sort((a,b) => a - b)
                            .reverse()
                            .slice(0, 5)
            if (acc) {
                const cmp = compareFlush(sorted, acc)
                if (cmp === -1) {
                    return acc 
                }
            }
            return sorted
        }
        return acc
    }, [])
}
export function isFullHouse(hand: Hand): [number, number] | null{
    const three = isNKind(hand, 3)
    const two = isNKind(hand, 2)
    if (three !== -1 && two !== -1) {
        return [three, two] 
    }
    return null
}
export function isFourKind(hand: Hand): [number, number] | null {
    const fourIndex: number = isNKind(hand, 4)
    if (fourIndex === -1){
        return null
    }

    const fourRank: Rank = ALL_RANKS[fourIndex]
    const filteredHand = hand.filter(c => c.rank != fourRank)
    const highCard = isHighCard(filteredHand, 1)[0]
    return [fourIndex, highCard]
}
export function isStraightFlush(hand: Hand): number {
    const _is = isStraight(hand)
    const _if = isFlush(hand)
    return _is >= 0 && _if ? _is : -1 
}
export function isRoyalFlush(hand: Hand): boolean {
    return isStraightFlush(hand) === ALL_RANKS.length - 1
}





export enum Ranking {
    HighCard = 1,
    OnePair,
    TwoPair,
    ThreeKind,
    Straight,
    Flush,
    FullHouse,
    FourKind,
    StraightFlush,
    RoyalFlush
}

export interface HandRank {
    rank: Ranking,
    data?: number[] | number
    index?: number
}


export function handToRank (rawHand: string[]): HandRank {
    const hand = toHand(rawHand)
    if (isRoyalFlush(hand)) {
        return { rank: Ranking.RoyalFlush }
    }
    const res = isStraightFlush(hand)
    if (res !== -1) {
        return { rank: Ranking.StraightFlush, data: res }
    }
    const fk = isFourKind(hand)
    if (fk) {
        return { rank: Ranking.FourKind, data: fk! }
    }
    const fh = isFullHouse(hand)
    if (fh) {
        return { rank: Ranking.FullHouse, data: fh! }
    }
    const fl = isFlush(hand)
    if (fl.length) {
        return { rank: Ranking.Flush, data: fl}
    }
    const st = isStraight(hand)
    if (st !== -1) {
        return { rank: Ranking.Straight, data: st }
    }
    const tk = isThreeKind(hand)
    if (tk) {
        return { rank: Ranking.ThreeKind, data: tk! }
    }
    const tp = isTwoPair(hand)
    if (tp) {
        return { rank: Ranking.TwoPair, data: tp! }
    }
    const op = isOnePair(hand)
    if (op) {
        return { rank: Ranking.OnePair, data: op! }
    }
    return { rank: Ranking.HighCard, data: isHighCard(hand, 5) }
}

const arrSort = (a: number[] , b: number[]) => {
    for (let i=0; i<a.length && i<b.length; i++) {
        if (a[i]!==b[i]){
            return a[i]-b[i]
        }
    }
   return a.length-b.length
}

export function compareHands(allRawHands: string[][]): number[] {
    // TODO: need to tidy up this function 
    const allHands = allRawHands.map(h => handToRank(h))
    const bestRank = allHands.reduce((acc, h) => {
        return Math.max(acc, h.rank.valueOf())
    }, -1)
   
    const topHands: HandRank[] = []
    const topHandIndexes: number[] = []
    allHands.forEach((h, ind) => {
        if (h.rank.valueOf() === bestRank) {
            h.index = ind
            topHands.push(h)
            topHandIndexes.push(ind)
        }
    })

    if (topHandIndexes.length === 1) {
        return [topHandIndexes[0]]
    }
    
    const rank = Ranking[bestRank]

    if (bestRank === Ranking.RoyalFlush) {
       return topHandIndexes 
    }
    if (bestRank === Ranking.StraightFlush) {
        const highest = Math.max(...topHands.map(h => h.data as number || -1))
        const lst: number[] = []
        return topHands.reduce((acc, h) => {
            if (h.data === highest && h.index !== undefined) {
                acc.push(h.index)
            }
            return acc
        }, lst) 
    }
    if (bestRank === Ranking.FourKind) {
        const bestFour: number = Math.max(...topHands.map(h => (h.data as number[])[0]))

        let currPlayers = topHands.filter(h => (h.data as number[])[0] === bestFour)
        if (currPlayers.length === 1) {
            return [currPlayers[0].index!]
        }
        // check highcard 
        const highCard: number = Math.max(...currPlayers.map(h => (h.data as number[])[1]))

        return topHands.filter(h => (h.data as number[])[0] === highCard)
                        .map(h => h.index!)
    }

    if (bestRank === Ranking.FullHouse) {
        // check 3kind first
        const bestThree: number = Math.max(...topHands.map(h => (h.data as number[])[0]))
        let currPlayers = topHands.filter(h => (h.data as number[])[0] === bestThree)
        if (currPlayers.length === 1) {
            return [currPlayers[0].index!]
        }
        // check 2kind 
        const bestTwo: number = Math.max(...currPlayers.map(h => (h.data as number[])[1]))

        return topHands.filter(h => (h.data as number[])[0] === bestTwo)
            .map(h => h.index!)
    }

    if (bestRank === Ranking.Flush) {
        const sortedHands = topHands.map(h => h.data as number[]).sort(arrSort).reverse()
        const best = sortedHands[0]
        return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                        .map(h => h.index!)
    }

    if (bestRank === Ranking.Straight) {
        const highCard = Math.max(...topHands.map(h => h.data as number))
        return topHands.filter(h => h.data === highCard)
                        .map(h => h.index!)
    }

    if (bestRank === Ranking.ThreeKind) {
        const sortedHands = topHands.map(h => h.data as number[]).sort(arrSort).reverse()
        const best = sortedHands[0]
        return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                        .map(h => h.index!)
    }

    if (bestRank === Ranking.TwoPair) {
        const sortedHands = topHands.map(h => h.data as number[]).sort(arrSort).reverse()
        const best = sortedHands[0]
        return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                        .map(h => h.index!)
    }
    if (bestRank === Ranking.OnePair) {
        const sortedHands = topHands.map(h => h.data as number[]).sort(arrSort).reverse()
        const best = sortedHands[0]
        return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                        .map(h => h.index!)
    }
    
    const sortedHands = topHands.map(h => h.data as number[]).sort(arrSort).reverse()
    const best = sortedHands[0]
    return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                    .map(h => h.index!)
}



