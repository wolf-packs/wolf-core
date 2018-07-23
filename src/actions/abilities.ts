export const SET_FOCUSED_ABILITY = 'SET_FOCUSED_ABILITY'
export const setFocusedAbility = (activeAbility: string | null) => ({
  type: SET_FOCUSED_ABILITY,
  payload: activeAbility
})