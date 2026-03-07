import { describe, it, expect } from 'vitest'
import {
  gridReducer,
  createInitialState,
  type GridState,
} from '@/lib/answer-grid-reducer'

describe('createInitialState', () => {
  it('creates answers array of given length filled with null', () => {
    const state = createInitialState(5)
    expect(state.answers).toHaveLength(5)
    expect(state.answers.every((a) => a === null)).toBe(true)
  })

  it('starts cursor at 0', () => {
    expect(createInitialState(3).cursor).toBe(0)
  })

  it('defaults to all mode', () => {
    expect(createInitialState(3).mode).toBe('all')
  })
})

describe('SET_ANSWER', () => {
  it('sets answer at given index', () => {
    const state = createInitialState(3)
    const next = gridReducer(state, { type: 'SET_ANSWER', index: 1, value: 'C' })
    expect(next.answers[1]).toBe('C')
  })

  it('does not mutate other answers', () => {
    const state: GridState = { ...createInitialState(3), answers: ['C', null, 'E'] }
    const next = gridReducer(state, { type: 'SET_ANSWER', index: 1, value: 'E' })
    expect(next.answers[0]).toBe('C')
    expect(next.answers[2]).toBe('E')
  })
})

describe('ADVANCE', () => {
  it('increments cursor by 1', () => {
    const state = createInitialState(3)
    const next = gridReducer(state, { type: 'ADVANCE' })
    expect(next.cursor).toBe(1)
  })

  it('does not advance past the last question', () => {
    const state: GridState = { ...createInitialState(3), cursor: 2 }
    const next = gridReducer(state, { type: 'ADVANCE' })
    expect(next.cursor).toBe(2)
  })
})

describe('BACK', () => {
  it('decrements cursor by 1', () => {
    const state: GridState = { ...createInitialState(3), cursor: 2 }
    const next = gridReducer(state, { type: 'BACK' })
    expect(next.cursor).toBe(1)
  })

  it('does not go below 0', () => {
    const state = createInitialState(3)
    const next = gridReducer(state, { type: 'BACK' })
    expect(next.cursor).toBe(0)
  })
})

describe('CLEAR', () => {
  it('sets answer at index to null', () => {
    const state: GridState = { ...createInitialState(3), answers: ['C', 'E', 'C'] }
    const next = gridReducer(state, { type: 'CLEAR', index: 1 })
    expect(next.answers[1]).toBeNull()
    expect(next.answers[0]).toBe('C')
  })
})

describe('PASTE', () => {
  it('fills answers from pasted values', () => {
    const state = createInitialState(4)
    const next = gridReducer(state, { type: 'PASTE', values: ['C', 'E', null, 'C'] })
    expect(next.answers).toEqual(['C', 'E', null, 'C'])
  })

  it('truncates paste to state length', () => {
    const state = createInitialState(2)
    const next = gridReducer(state, { type: 'PASTE', values: ['C', 'E', 'C', 'E'] })
    expect(next.answers).toHaveLength(2)
    expect(next.answers).toEqual(['C', 'E'])
  })

  it('pads with existing answers when paste is shorter than count', () => {
    const state: GridState = { ...createInitialState(4), answers: ['C', 'E', 'C', 'E'] }
    const next = gridReducer(state, { type: 'PASTE', values: ['A', 'B'] })
    expect(next.answers).toEqual(['A', 'B', 'C', 'E'])
  })
})

describe('SET_MODE', () => {
  it('switches to single mode', () => {
    const state = createInitialState(3)
    const next = gridReducer(state, { type: 'SET_MODE', mode: 'single' })
    expect(next.mode).toBe('single')
  })

  it('switches back to all mode', () => {
    const state: GridState = { ...createInitialState(3), mode: 'single' }
    const next = gridReducer(state, { type: 'SET_MODE', mode: 'all' })
    expect(next.mode).toBe('all')
  })
})

describe('SET_CURSOR', () => {
  it('sets cursor to given index', () => {
    const state = createInitialState(5)
    const next = gridReducer(state, { type: 'SET_CURSOR', index: 3 })
    expect(next.cursor).toBe(3)
  })
})
