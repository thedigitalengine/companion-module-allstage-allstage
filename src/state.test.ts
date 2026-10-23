import test from 'node:test'
import assert from 'node:assert/strict'
import { applyStateMessage, formatClock, initialState } from './state.js'

test('state messages update the state and report changes', () => {
	const s = initialState()
	assert.equal(applyStateMessage(s, { address: '/state/playing', args: [1] }), true)
	assert.equal(applyStateMessage(s, { address: '/state/playing', args: [1] }), false)
	applyStateMessage(s, { address: '/state/item/index', args: [3] })
	applyStateMessage(s, { address: '/state/item/name', args: ['Encore'] })
	applyStateMessage(s, { address: '/state/time', args: [61.5] })
	applyStateMessage(s, { address: '/state/remaining', args: [30] })
	applyStateMessage(s, { address: '/state/hazards/armed', args: [1] })
	assert.deepEqual(s, {
		playing: true,
		itemIndex: 3,
		itemName: 'Encore',
		timeSeconds: 61.5,
		remainingSeconds: 30,
		hazardsArmed: true,
	})
})

test('wrong types and unknown addresses are ignored', () => {
	const s = initialState()
	assert.equal(applyStateMessage(s, { address: '/state/playing', args: ['x'] }), false)
	assert.equal(applyStateMessage(s, { address: '/state/item/name', args: [5] }), false)
	assert.equal(applyStateMessage(s, { address: '/other', args: [1] }), false)
	assert.deepEqual(s, initialState())
})

test('formatClock', () => {
	assert.equal(formatClock(0), '0:00')
	assert.equal(formatClock(61.9), '1:01')
	assert.equal(formatClock(3725), '1:02:05')
	assert.equal(formatClock(-4), '0:00')
})
