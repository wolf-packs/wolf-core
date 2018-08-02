import { AbilityStatus } from '../types'
import { Reducer } from 'redux'
import { SET_ABILITY_STATUS } from '../actions'

const reducer: Reducer = (prev: AbilityStatus[] = [], action): AbilityStatus[] => {
  if (action.type === SET_ABILITY_STATUS) {
    const {abilityName, value: isCompleted} = action.payload

    const abilityStatus = [...prev]
    const targetIndex = abilityStatus.findIndex((_) => _.abilityName === abilityName)

    // ability status already exists.. update object
    if (targetIndex !== -1) {
      abilityStatus[targetIndex] = { abilityName, isCompleted }
      return abilityStatus
    }

    // create ability status
    abilityStatus.push({ abilityName, isCompleted })
    return abilityStatus
  }
  
  return prev
}

export default reducer
