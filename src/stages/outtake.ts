import { Store } from 'redux'
import { WolfState } from '../types'

interface OuttakeResult {

}

/**
 * Outtake Stage (S5)
 * 
 * Ensure developer has access to all `OutputMessageItems`
 * 
 * @param store redux
 */
export default function outtake(store: Store<WolfState>): OuttakeResult {
  const { getState } = store
  const state: WolfState = getState()
  
  return 0
}