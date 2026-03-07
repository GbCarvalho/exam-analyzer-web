export type GridMode = 'all' | 'single'

export interface GridState {
  answers: (string | null)[]
  cursor: number
  mode: GridMode
}

export type GridAction =
  | { type: 'SET_ANSWER'; index: number; value: string }
  | { type: 'ADVANCE' }
  | { type: 'BACK' }
  | { type: 'SET_MODE'; mode: GridMode }
  | { type: 'SET_CURSOR'; index: number }
  | { type: 'PASTE'; values: (string | null)[] }
  | { type: 'CLEAR'; index: number }

export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: state.answers.map((a, i) => (i === action.index ? action.value : a)),
      }

    case 'ADVANCE':
      return {
        ...state,
        cursor: Math.min(state.cursor + 1, state.answers.length - 1),
      }

    case 'BACK':
      return {
        ...state,
        cursor: Math.max(state.cursor - 1, 0),
      }

    case 'CLEAR':
      return {
        ...state,
        answers: state.answers.map((a, i) => (i === action.index ? null : a)),
      }

    case 'PASTE':
      return {
        ...state,
        answers: [
          ...action.values.slice(0, state.answers.length),
          ...state.answers.slice(action.values.length),
        ],
      }

    case 'SET_MODE':
      return { ...state, mode: action.mode }

    case 'SET_CURSOR':
      return { ...state, cursor: action.index }

    default:
      return state
  }
}

export function createInitialState(count: number, mode: GridMode = 'all'): GridState {
  return {
    answers: Array<string | null>(count).fill(null),
    cursor: 0,
    mode,
  }
}
