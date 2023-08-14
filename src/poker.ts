
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
    return -1
}


// Calculate Hands
export function isHighCard(hand: Hand): number {
    return hand.reduce((acc, v) => Math.max(acc, ALL_RANKS.indexOf(v.rank)), -1)
}
export function isOnePair(hand: Hand): number {
    return isNKind(hand, 2)    
}
export function isTwoPair(hand: Hand): [number, number] | null {
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
    return [pairs[0], pairs[1]]
}
export function isThreeKind(hand: Hand): number {
    return isNKind(hand, 3)
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
    const three = isThreeKind(hand)
    const two = isOnePair(hand)
    if (three !== -1 && two !== -1) {
        return [three, two] 
    }
    return null
}
export function isFourKind(hand: Hand): number {
    return isNKind(hand, 4)
}
export function isStraightFlush(hand: Hand): number {
    const _is = isStraight(hand)
    const _if = isFlush(hand)
    return _is >= 0 && _if ? _is : -1 
}
export function isRoyalFlush(hand: Hand): boolean {
    return isStraightFlush(hand) === ALL_RANKS.length - 1
}







export function bestHands(rawHands: string[]): number {
    const allHands = rawHands.map(toHand)

    // TODO
    return -1
}
