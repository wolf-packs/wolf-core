export const SET_FOCUSED_ABILITY = 'SET_FOCUSED_ABILITY'
export const setFocusedAbility = (focusedAbility: string | null) => ({
  type: SET_FOCUSED_ABILITY,
  payload: focusedAbility
})

export const SET_DEFAULT_ABILITY = 'SET_DEFAULT_ABILITY'
export const setDefaultAbility = (defaultAbilityName: string | null) => ({
  type: SET_DEFAULT_ABILITY,
  payload: defaultAbilityName
})

export const SET_ABILITY_STATUS = 'SET_ABILITY_STATUS'
export const setAbilityStatus = (abilityName: string, value: boolean) => ({
  type: SET_ABILITY_STATUS,
  payload: { abilityName, value }
})

export const ABILITY_COMPLETED = 'ABILITY_COMPLETED'
export const abilityCompleted = (abilityName: string | null) => ({
  type: ABILITY_COMPLETED,
  payload: abilityName
})
