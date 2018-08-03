import { WolfState, OutputMessageItem } from '../types'

export const getOutputMessageQueue = (state: WolfState): OutputMessageItem[] => state.outputMessageQueue
