
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

    if (aRank < bRank)
        return -1
    if (aRank == bRank)
        return 0 
    return 1
}

export function toCard(hand: string): Card | undefined {
    if (hand.length != 2)
        return undefined

    const rank = hand[0].toUpperCase()
    const suit = hand[1].toUpperCase()

    if (!isRank(rank) || !isSuit(suit))
        return undefined

    return {
        rank: rank as Rank,
        suit: suit as Suit,
    }
}

export function toHand(hand: string[]): Hand {
    return hand.reduce((acc: Card[], h: string) => {
        const res = toCard(h)
        if (res != undefined)
            acc.push(res)
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
        if (a[i] > b[i])
            return 1
        if (a[i] < b[i])
            return -1
    }
    return 0
}


// Calculate Hands
export function isHighCard(hand: Hand, numCards: number): number[] {
    if (numCards >= hand.length)
        return []
    return hand.sort(sortCardHelper)
                .reverse()
                .slice(0, numCards)
                .map(c => ALL_RANKS.indexOf(c.rank))
}
export function isOnePair(hand: Hand): [number, number, number, number] | null {
    const highestPairIndex = isNKind(hand, 2)
    if (highestPairIndex === -1)
        return null
    const newHand = hand.filter(c => c.rank !== ALL_RANKS[highestPairIndex] )
    // ensure only 1 pair 
    if (isNKind(newHand, 2) !== -1 || isNKind(newHand, 3) !== -1)
        return null
    const [first, second, third] = isHighCard(newHand, 3)
    return [highestPairIndex, first, second, third]
}
export function isTwoPair(hand: Hand): [number, number, number] | null {
    let pairs = Object.entries(rankMap(hand))
        .reduce((acc: number[], v) => {
            if (v[1] === 2)
                acc.push(ALL_RANKS.indexOf(v[0] as Rank))
            return acc 
        }, [])
    if (pairs.length < 2)
        return null
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
    if (isNKind(hand, 2) !== -1)
        return null

    const threeKindRank: Rank = ALL_RANKS[threeKindIndex]

    const filteredList = hand.filter(c => c.rank !== threeKindRank)
                             .sort(sortCardHelper)
                             .reverse()
    const firstHighest = ALL_RANKS.indexOf(filteredList[0].rank)
    const secondHighest = ALL_RANKS.indexOf(filteredList[1].rank) 

    return [threeKindIndex, firstHighest, secondHighest]
}
export function isStraight(hand: Hand): number[] | null {
    let ranks = hand.sort(sortCardHelper).map(c => ALL_RANKS.indexOf(c.rank))
    if (ranks.includes(ALL_RANKS.length - 1)) // allow Ace to act as 1
        ranks = [-1,...ranks]

    let m = -1
    for (let i = 0; i < ranks.length - 4; i++) {
        if ( ranks[i+1] === ranks[i] + 1 &&
            ranks[i+2] === ranks[i] + 2 &&
            ranks[i+3] === ranks[i] + 3 &&
            ranks[i+4] === ranks[i] + 4 
        ) 
            m = ranks[i+4]
    }
    if (m === -1)
        return null
    return [m]
}
export function isFlush(hand: Hand): number[] | null {
    const sm = suitMap(hand)
    const res = Object.entries(sm).reduce((acc: number[], v) => {
        if (v[1] >= 5) {
            const sorted = hand.filter(c => c.suit === v[0])
                            .map(c => ALL_RANKS.indexOf(c.rank))
                            .sort((a,b) => a - b)
                            .reverse()
                            .slice(0, 5)
            if (acc && compareFlush(sorted, acc) === -1) 
                return acc 
            return sorted
        }
        return acc
    }, [])
    return res.length > 0 ? res : null
}

export function isFullHouse(hand: Hand): [number, number] | null {
    const three = isNKind(hand, 3)
    const two = isNKind(hand, 2)
    if (three !== -1 && two !== -1)
        return [three, two] 
    return null
}
export function isFourKind(hand: Hand): [number, number] | null {
    const fourIndex: number = isNKind(hand, 4)
    if (fourIndex === -1)
        return null

    const fourRank: Rank = ALL_RANKS[fourIndex]
    const filteredHand = hand.filter(c => c.rank != fourRank)
    const highCard = isHighCard(filteredHand, 1)[0]
    return [fourIndex, highCard]
}
export function isStraightFlush(hand: Hand): number[] | null {
    const _is = isStraight(hand)
    const _if = isFlush(hand)
    return _is && _if ? _is : null
}
export function isRoyalFlush(hand: Hand): boolean {
    return isStraightFlush(hand)?.at(0) === ALL_RANKS.length - 1
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
    data?: number[] 
    index?: number
}


export function handToRank (rawHand: string[]): HandRank {
    const hand = toHand(rawHand)
    if (isRoyalFlush(hand))
        return { rank: Ranking.RoyalFlush }

    const sf = isStraightFlush(hand)
    if (sf)
        return { rank: Ranking.StraightFlush, data: sf! }
    
    const fk = isFourKind(hand)
    if (fk) 
        return { rank: Ranking.FourKind, data: fk! }
    
    const fh = isFullHouse(hand)
    if (fh) 
        return { rank: Ranking.FullHouse, data: fh! }
    
    const fl = isFlush(hand)
    if (fl) 
        return { rank: Ranking.Flush, data: fl! }
    
    const st = isStraight(hand)
    if (st) 
        return { rank: Ranking.Straight, data: st! }
    
    const tk = isThreeKind(hand)
    if (tk) 
        return { rank: Ranking.ThreeKind, data: tk! }
    
    const tp = isTwoPair(hand)
    if (tp) 
        return { rank: Ranking.TwoPair, data: tp! }
    
    const op = isOnePair(hand)
    if (op) 
        return { rank: Ranking.OnePair, data: op! }
    
    return { rank: Ranking.HighCard, data: isHighCard(hand, 5) }
}

const arrSort = (a: number[] , b: number[]) => {
    for (let i=0; i<a.length && i<b.length; i++) {
        if (a[i]!==b[i])
            return a[i]-b[i]
    }
   return a.length-b.length
}

export function compareHands(allRawHands: string[][]): number[] {
    const allHands = allRawHands.map(h => handToRank(h))
    const bestRank = Math.max(...allHands.map(h => h.rank.valueOf()))
   
    const topHands: HandRank[] = []
    const topHandIndexes: number[] = []
    allHands.forEach((h, ind) => {
        if (h.rank.valueOf() === bestRank) {
            h.index = ind
            topHands.push(h)
            topHandIndexes.push(ind)
        }
    })

    if (topHandIndexes.length === 1)
        return [topHandIndexes[0]]
    
    if (bestRank === Ranking.RoyalFlush)
       return topHandIndexes 
    
    const best = topHands.map(h => h.data as number[])
                         .sort(arrSort)
                         .at(-1)
    return topHands.filter(h => JSON.stringify(h.data) === JSON.stringify(best))
                    .map(h => h.index!)
}

