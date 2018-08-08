import { Reducer } from 'redux'
import { START_INTAKE_STAGE, ABILITY_COMPLETED } from '../actions'

const reducer: Reducer = (prev: string[] = [], action) => {
  if ( action.type === START_INTAKE_STAGE) {
    return []
  }

  if ( action.type === ABILITY_COMPLETED ) {
    return [...prev, action.payload]
  }

  return prev
}

export default reducer
