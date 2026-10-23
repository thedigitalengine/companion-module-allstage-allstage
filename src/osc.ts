export type OscArg = number | string

const pad4 = (n: number): number => (n + 3) & ~3

function oscString(s: string): Buffer {
	const raw = Buffer.from(s, 'utf8')
	const out = Buffer.alloc(pad4(raw.length + 1))
	raw.copy(out)
	return out
}

/** Encode one OSC 1.0 message. Integers go as int32, other numbers as float32, strings as strings. */
export function encodeOsc(address: string, args: OscArg[] = []): Buffer {
	if (!address.startsWith('/')) throw new Error('OSC address must start with "/"')
	let tags = ','
	const parts: Buffer[] = []
	for (const a of args) {
		if (typeof a === 'string') {
			tags += 's'
			parts.push(oscString(a))
		} else if (Number.isInteger(a)) {
			tags += 'i'
			const b = Buffer.alloc(4)
			b.writeInt32BE(a)
			parts.push(b)
		} else {
			tags += 'f'
			const b = Buffer.alloc(4)
			b.writeFloatBE(a)
			parts.push(b)
		}
	}
	return Buffer.concat([oscString(address), oscString(tags), ...parts])
}

export type OscMessage = { address: string; args: OscArg[] }

/** Read a NUL-terminated, 4-byte padded OSC string at `at`; returns [text, nextOffset] or null if malformed. */
function readOscString(b: Buffer, at: number): [string, number] | null {
	if (at >= b.length) return null
	const end = b.indexOf(0, at)
	if (end < 0) return null
	return [b.toString('utf8', at, end), pad4(end + 1)]
}

/**
 * Decode one OSC 1.0 message (what AllStage's state feed sends). Supports i, f, s, h, d, T, F, N, I;
 * returns null for anything malformed, truncated, or not a plain message (e.g. a bundle).
 */
export function decodeOsc(buf: Buffer): OscMessage | null {
	const a = readOscString(buf, 0)
	if (!a || !a[0].startsWith('/')) return null
	const tagsRead = readOscString(buf, a[1])
	if (!tagsRead || !tagsRead[0].startsWith(',')) return null
	let at = tagsRead[1]
	const args: OscArg[] = []
	for (const t of tagsRead[0].slice(1)) {
		switch (t) {
			case 'i':
				if (at + 4 > buf.length) return null
				args.push(buf.readInt32BE(at))
				at += 4
				break
			case 'f':
				if (at + 4 > buf.length) return null
				args.push(buf.readFloatBE(at))
				at += 4
				break
			case 'd':
				if (at + 8 > buf.length) return null
				args.push(buf.readDoubleBE(at))
				at += 8
				break
			case 'h':
				if (at + 8 > buf.length) return null
				args.push(Number(buf.readBigInt64BE(at)))
				at += 8
				break
			case 's': {
				const s = readOscString(buf, at)
				if (!s) return null
				args.push(s[0])
				at = s[1]
				break
			}
			case 'T':
				args.push(1)
				break
			case 'F':
				args.push(0)
				break
			case 'N':
			case 'I':
				break
			default:
				return null
		}
	}
	return { address: a[0], args }
}
