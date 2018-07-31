import { AbilityStatus } from '../types'
import { Reducer } from 'redux'
import { SET_ABILITY_STATUS } from '../actions'

const reducer: Reducer = (prev: AbilityStatus[] = [], action): AbilityStatus[] => {
  if (action.type === SET_ABILITY_STATUS) {
    const {abilityName, value: isCompleted} = action.payload
    return [
      ...prev,
      { abilityName, isCompleted }
    ]
  }
  
  return prev
}

export default reducer
