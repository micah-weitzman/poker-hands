import { describe, expect, test } from '@jest/globals'
import * as pk from './poker'

describe('ToCard', () => {
    test('ToCard simple numbers', () => {
        expect(pk.toCard('2S')).toMatchObject({rank: '2', suit: 'S'})
        expect(pk.toCard('4D')).toMatchObject({rank: '4', suit: 'D'})
        expect(pk.toCard('6C')).toMatchObject({rank: '6', suit: 'C'})
        expect(pk.toCard('9H')).toMatchObject({rank: '9', suit: 'H'})
    })
    test('ToCard face cards', () => {
        expect(pk.toCard('TS')).toMatchObject({rank: 'T', suit: 'S'})
        expect(pk.toCard('JD')).toMatchObject({rank: 'J', suit: 'D'})
        expect(pk.toCard('QH')).toMatchObject({rank: 'Q', suit: 'H'})
        expect(pk.toCard('KC')).toMatchObject({rank: 'K', suit: 'C'})
        expect(pk.toCard('AS')).toMatchObject({rank: 'A', suit: 'S'})
    })
    test('ToCard bad rank', () => {
        expect(pk.toCard('1S')).toBeUndefined()
        expect(pk.toCard('PC')).toBeUndefined()
        expect(pk.toCard('0H')).toBeUndefined()
    })
    test('ToCard bad suit', () => {
        expect(pk.toCard('bad string')).toBeUndefined()
        expect(pk.toCard('')).toBeUndefined()
        expect(pk.toCard('5A')).toBeUndefined()
        expect(pk.toCard('DA')).toBeUndefined()
    })
    test('ToCard lowercase converted to uppercase', () => {
        expect(pk.toCard('ts')).toMatchObject({rank: 'T', suit: 'S'})
        expect(pk.toCard('tS')).toMatchObject({rank: 'T', suit: 'S'})
        expect(pk.toCard('Ts')).toMatchObject({rank: 'T', suit: 'S'})
        expect(pk.toCard('3h')).toMatchObject({rank: '3', suit: 'H'})
    })
})


describe('ToHand', () => {
    test('ToHand good', () => {
        const handRaw = ['2D', 'AH', 'AS', '5S', 'AC', '7H', '8H']
        const handCards = [
            {rank: '2', suit: 'D'},
            {rank: 'A', suit: 'H'},
            {rank: 'A', suit: 'S'},
            {rank: '5', suit: 'S'},
            {rank: 'A', suit: 'C'},
            {rank: '7', suit: 'H'},
            {rank: '8', suit: 'H'},
        ]
        expect(pk.toHand(handRaw)).toMatchObject(handCards)
    })
    test('ToHand with bad cards', () => {
        const handRaw = ['2D', '1H', '5F', '']
        const handCards = [
            {rank: '2', suit: 'D'}
        ]
        expect(pk.toHand(handRaw)).toMatchObject(handCards)
    })
})

describe('High Card', () => {
    test('High ace', () => {
        const hand = pk.toHand(['2D', '9H', 'AS', '5S', '9C', '7H', '8H'])
        const hc = pk.isHighCard(hand)
        expect(pk.ALL_RANKS[hc]).toBe('A')
    })
    test('No highcard', () => {
        const hc = pk.isHighCard([])
        expect(hc).toBe(-1)
    })
})

describe('OnePair', () => {
    test('OnePair good', () => {
        const hand = pk.toHand(['2D', '9H', 'AS', '5S', '9C', '7H', '8H'])
        expect(pk.isOnePair(hand)).toBe(7) 
    })
    test('OnePair highest', () => {
        const hand = pk.toHand(['2D', '9H', 'AS', '5S', '9C', 'AH', '8H'])
        const highPair = pk.isOnePair(hand) 
        const textRank = pk.ALL_RANKS[highPair]
        expect(textRank).toBe('A')
    })
    test('OnePair no pair', () => {
        const hand = pk.toHand(['2H', '3H', '4H', '5H', '6H', '7H', '8H'])
        const pair = pk.isOnePair(hand)
        expect(pair).toBe(-1)
    })
})

describe('TwoPair', () => {
    test('Two pair good', () => {
        const hand = pk.toHand(['2D', '9H', '5D', '5S', '9C', 'AH', '8H'])
        const res = pk.isTwoPair(hand)
        expect(pk.ALL_RANKS[res![0]]).toBe('9')
        expect(pk.ALL_RANKS[res![1]]).toBe('5')
    })
    test('Two pair with 3 possibile pairs', () => {
        const hand = pk.toHand(['KD', '9H', '5D', '5S', '9C', 'AH', 'KH'])
        const res = pk.isTwoPair(hand)
        expect(pk.ALL_RANKS[res![0]]).toBe('K')
        expect(pk.ALL_RANKS[res![1]]).toBe('9')
    })
    test('Two pair only 1 pair', () => {
        const hand = pk.toHand(['2D', '9H', '4D', '5S', '9C', 'AH', 'KH'])
        expect(pk.isTwoPair(hand)).toBeNull()
    })
    test('Two pair no pairs', () => {
        const hand = pk.toHand(['2D', '9H', '4D', '5S', '8C', 'AH', 'KH'])
        expect(pk.isTwoPair(hand)).toBeNull()
    })
    test('Two pairs, but is three pair', () => {
        const hand = pk.toHand(['2D', '2H', '2D', '5S', '5C', 'AH', 'KH'])
        expect(pk.isTwoPair(hand)).toBeNull()
    })
})


describe('Three of a kind', () => {
    test('Three kind good', () => {
        const hand = pk.toHand(['2D', '9H', '9S', '5S', '9C', 'AH', '8H'])
        const threeKind = pk.isThreeKind(hand)
        const textRank = pk.ALL_RANKS[threeKind]
        expect(textRank).toBe('9')
    })
    test('Three kind higher', () => {
        const hand = pk.toHand(['KD', '9H', '9S', 'KS', '9C', 'KH', '8H'])
        const threeKind = pk.isThreeKind(hand)
        const textRank = pk.ALL_RANKS[threeKind]
        expect(textRank).toBe('K')
    })
    test('Three kind none', () => {
        const hand = pk.toHand(['4D', '7H', '9S', 'KS', '9C', 'KH', '8H'])
        const res = pk.isThreeKind(hand)
        expect(res).toBe(-1)
    })
})

describe('Straight', () => {
    test('regular straight', () => {
        const hand = pk.toHand(['2D', '3H', '4S', '5S', '6C', 'KH', '8H'])
        const res = pk.isStraight(hand)
        expect(pk.ALL_RANKS[res]).toBe('6')
    })
    test('Long straight', () => {
        const hand = pk.toHand(['2D', '3H', '4S', '5S', '6C', '7H', '8H'])
        const res = pk.isStraight(hand)
        expect(pk.ALL_RANKS[res]).toBe('8')
    })
    test('Royal straight', () => {
        const hand = pk.toHand(['2D', '3H', 'TS', 'JS', 'QC', 'KH', 'AH'])
        const res = pk.isStraight(hand)
        expect(pk.ALL_RANKS[res]).toBe('A')
    })
    test('Ace low straight', () => {
        const hand = pk.toHand(['AS', '2D', '3H', '4S', '5S', '7C', '8H'])
        const res = pk.isStraight(hand)
        expect(pk.ALL_RANKS[res]).toBe('5')
    })
    test('No straight', () => {
        const hand = pk.toHand(['4D', '7D', '9D', 'TD', '8D', 'KH', '8H'])
        expect(pk.isStraight(hand)).toBe(-1)
    })
})

describe('Flush', () => {
    test('Simple flush', () => {
        const hand = pk.toHand(['4D', '7D', '9D', 'TD', '8D', 'KH', '8H'])
        const flush = pk.isFlush(hand)
        console.log(flush)
        expect(flush.map(c => pk.ALL_RANKS[c])).toEqual(['T', '9', '8', '7', '4'])
    })
    test('Flush with more than 5', () => {
        const hand = pk.toHand(['4D', '7D', '9D', 'TD', '8D', 'KD', '3D'])
        const flush = pk.isFlush(hand)
        expect(flush.length).toBe(5)
        expect(flush.map(c => pk.ALL_RANKS[c])).toEqual(['K', 'T', '9', '8', '7'])
    })
    test('No flush', () => {
        const hand = pk.toHand(['4D', '7H', '9S', 'KS', '9C', 'KH', '8H'])
        expect(pk.isFlush(hand)).toEqual([])
    })
})

describe('Full House', () => {
    test('Simple full house', () => {
        const hand = pk.toHand(['3D', '3S', '3H', '5C', '5H', '6C', '7C'])
        const res = pk.isFullHouse(hand)
        expect(pk.ALL_RANKS[res![0]]).toBe('3')
        expect(pk.ALL_RANKS[res![1]]).toBe('5')
    })
    test('Full house 2 possible pairs', () => {
        const hand = pk.toHand(['3D', '3S', '3H', '5C', '5H', '7H', '7C'])
        const res = pk.isFullHouse(hand)
        expect(pk.ALL_RANKS[res![0]]).toBe('3')
        expect(pk.ALL_RANKS[res![1]]).toBe('7')
    })
    test('Full house no possible pairs', () => {
        const hand = pk.toHand(['3D', '3S', '3H', '4C', '5H', '6H', 'TC'])
        const res = pk.isFullHouse(hand)
        expect(res).toBeNull()
    })
    test('Full house no three of a kind', () => {
        const hand = pk.toHand(['3D', 'QS', '3H', '6C', '5H', '6H', 'TC'])
        const res = pk.isFullHouse(hand)
        expect(res).toBeNull()
    })
})

describe('Four of a kind', () => {
    test('Four kind good', () => {
        const hand = pk.toHand(['2D', '9H', '9S', '5S', '9C', '9H', '8H'])
        const res = pk.isFourKind(hand)
        const textRank = pk.ALL_RANKS[res]
        expect(textRank).toBe('9')
    })
    test('Four kind none', () => {
        const hand = pk.toHand(['KD', '9H', '9S', 'KS', '9C', 'KH', '8H'])
        const res = pk.isFourKind(hand)
        expect(res).toBe(-1)
    })
})

describe('Straight Flush', () => {
    test('Simple straight flush', () => {
        const hand = pk.toHand(['2S', '3S', '4S', '5S', '6S', 'KD'])
        const res = pk.isStraightFlush(hand)
        expect(pk.ALL_RANKS[res]).toBe('6')
    })
    test('Long straight flush', () => {
        const hand = pk.toHand(['2S', '3S', '4S', '5S', '6S', '7S', '8S'])
        const res = pk.isStraightFlush(hand)
        expect(pk.ALL_RANKS[res]).toBe('8')
    })
    test('No straight flush', () => {
        const hand = pk.toHand(['KD', '9H', '9S', 'KS', '9C', 'KH', '8H'])
        const res = pk.isStraightFlush(hand)
        expect(res).toBe(-1)
    })
})

describe('Royal Flush', () => {
    test('Royal flush simple', () => {
        const hand = pk.toHand(['KS', 'QS', 'JS', 'TS', 'AS', '2D'])
        expect(pk.isRoyalFlush(hand)).toBe(true)
    })
    test('Royal flush wrong', () => {
        const hand = pk.toHand(['KD', 'QS', 'JS', 'TS', 'AS', '2D'])
        expect(pk.isRoyalFlush(hand)).toBe(true)
    })
})
