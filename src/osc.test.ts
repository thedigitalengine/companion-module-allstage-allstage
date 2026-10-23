import test from 'node:test'
import assert from 'node:assert/strict'
import { encodeOsc } from './osc.js'

test('no-arg message is padded to 4 bytes', () => {
	const b = encodeOsc('/play')
	assert.equal(b.length % 4, 0)
	assert.equal(b.toString('latin1'), '/play\0\0\0,\0\0\0')
})

test('int32 argument', () => {
	const b = encodeOsc('/song/select', [3])
	assert.equal(b.readInt32BE(b.length - 4), 3)
	assert.match(b.toString('latin1'), /,i/)
})

test('float and string arguments', () => {
	const f = encodeOsc('/locate', [1.5])
	assert.equal(f.readFloatBE(f.length - 4), 1.5)
	const s = encodeOsc('/song/select', ['Intro'])
	assert.match(s.toString('latin1'), /,s\0\0Intro\0\0\0/)
})

import { decodeOsc } from './osc.js'

test('decode round-trips ints, floats and strings', () => {
	assert.deepEqual(decodeOsc(encodeOsc('/state/playing', [1])), { address: '/state/playing', args: [1] })
	assert.deepEqual(decodeOsc(encodeOsc('/state/time', [12.5])), { address: '/state/time', args: [12.5] })
	assert.deepEqual(decodeOsc(encodeOsc('/state/item/name', ['Intro "A"'])), {
		address: '/state/item/name',
		args: ['Intro "A"'],
	})
	assert.deepEqual(decodeOsc(encodeOsc('/hazards/kill')), { address: '/hazards/kill', args: [] })
})

test('decode handles a 4-byte-aligned string exactly (NUL pad block)', () => {
	assert.deepEqual(decodeOsc(encodeOsc('/s', ['abc'])), { address: '/s', args: ['abc'] })
	assert.deepEqual(decodeOsc(encodeOsc('/s', ['abcd'])), { address: '/s', args: ['abcd'] })
})

test('decode matches the bytes AllStage sends', () => {
	// "/state/playing" ",i" 1 - hand-built as the C++ OscStateFeed lays it out
	const b = Buffer.concat([Buffer.from('/state/playing\0\0'), Buffer.from(',i\0\0'), Buffer.from([0, 0, 0, 1])])
	assert.deepEqual(decodeOsc(b), { address: '/state/playing', args: [1] })
})

test('decode rejects malformed input', () => {
	assert.equal(decodeOsc(Buffer.alloc(0)), null)
	assert.equal(decodeOsc(Buffer.from('nope\0\0\0\0')), null)
	assert.equal(decodeOsc(Buffer.from('#bundle\0')), null)
	const truncated = encodeOsc('/state/time', [1.5]).subarray(0, -2)
	assert.equal(decodeOsc(truncated), null)
	assert.equal(decodeOsc(Buffer.from('/x\0\0,q\0\0')), null)
})
