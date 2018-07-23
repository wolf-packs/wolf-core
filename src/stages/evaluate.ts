import { Store } from 'redux'
import { WolfState } from '../types';

/**
 * Evaluate Stage (S3):
 * 
 * TODO
 * 
 * @param
 * 
 * @returns
 */
export default function evaluate({ dispatch, getState }: Store): void {
  const state: WolfState = getState()

  // Check if there were any slots filled during this turn
  if (state.filledSlotsOnCurrentTurn.length > 0) {
    // Check if any abilities have been completed as a result of the filled slot(s)
  }

  // PROMPT STACK EMPTY
  if (state.promptedSlotStack.length === 0) {
    // Find slot
  }

  // PROMPT STACK HAS ITEMS

  return
}

/**
 * Beginning of S3 possible states:
 * (getSlotFillFlag = true)
 * > slot has been filled (getSlotFillFlag) -> idle state -> select new slot to prompt (update prompted slot + active ability)
 * 
 * (getSlotFillFlag = false) (promptSlot = null)
 * > no slot filled -> no retry (no promptSlot)-> idle state -> select new slot to prompt (update prompted slot + active ability)
 * 
 * (getSlotFillFlag = false) (promptSlot = <string>)
 * > no slot filled -> retry has been made (promptSlot) -> do nothing
 */
