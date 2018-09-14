/* global describe, test, expect */
import { parseRive, runWolfTests, createWolfRunner } from 'botbuilder-wolf-rive'
import abilities from '../abilities'
import nlpWolf from '../nlp'

const wolfRunner = createWolfRunner(
  nlpWolf,
  () => abilities,
  'listAbility'
)

const demo = parseRive('./examples/alarmBot/tests/demo.rive')
describe('Demo Stage', () => {
  runWolfTests(demo, wolfRunner)
})