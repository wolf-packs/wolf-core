import { AbilityStatus } from '../types'
import { Reducer } from 'redux'
import { SET_ABILITY_STATUS } from '../actions'

const reducer: Reducer = (prev: AbilityStatus[] = [], action) => {
  if (action.type === SET_ABILITY_STATUS) {
    const {abilityName, value} = action.payload
    return [
      ...prev,
      { abilityName, value }
    ]
  }
  
  return prev
}

export default reducer
