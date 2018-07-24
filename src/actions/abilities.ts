export const SET_FOCUSED_ABILITY = 'SET_FOCUSED_ABILITY'
export const setFocusedAbility = (focusedAbility: string | null) => ({
  type: SET_FOCUSED_ABILITY,
  payload: focusedAbility
})

export const SET_ABILITY_COMPLETE_ON_CURRENT_TURN = 'SET_ABILITY_COMPLETE_ON_CURRENT_TURN'
// TODO: Implement Reducer (Renamed. See ABILITY_COMPLETED)
export const setAbilityCompleteOnCurrentTurn = (abilityName: string | null) => ({
  type: SET_ABILITY_COMPLETE_ON_CURRENT_TURN,
  payload: abilityName
})

export const SET_DEFAULT_ABILITY = 'SET_DEFAULT_ABILITY' // TODO: implement reducer (Done)
export const setDefaultAbility = (defaultAbilityName: string | null) => ({
  type: SET_DEFAULT_ABILITY,
  payload: defaultAbilityName
})

export const ABILITY_COMPLETED = 'ABILITY_COMPLETED'
export const abilityCompleted = (abilityName: string | null) => ({
  type: ABILITY_COMPLETED,
  payload: abilityName
})