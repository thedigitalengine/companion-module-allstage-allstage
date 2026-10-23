import type { OscMessage } from './osc.js'

/** What AllStage's optional OSC state feed tells us (see AllStage-Core OscStateFeed). */
export type AllStageState = {
	playing: boolean
	itemIndex: number
	itemName: string
	timeSeconds: number
	remainingSeconds: number
	hazardsArmed: boolean
}

export const initialState = (): AllStageState => ({
	playing: false,
	itemIndex: 0,
	itemName: '',
	timeSeconds: 0,
	remainingSeconds: 0,
	hazardsArmed: false,
})

/** m:ss (h:mm:ss from one hour). */
export function formatClock(seconds: number): string {
	const t = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
	const h = Math.floor(t / 3600)
	const m = Math.floor((t % 3600) / 60)
	const s = t % 60
	const ss = String(s).padStart(2, '0')
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** Apply one decoded message; returns true when it changed the state. */
export function applyStateMessage(state: AllStageState, msg: OscMessage): boolean {
	const v = msg.args[0]
	const num = typeof v === 'number' ? v : Number.NaN
	switch (msg.address) {
		case '/state/playing':
			if (Number.isNaN(num)) return false
			return set(state, 'playing', num !== 0)
		case '/state/item/index':
			if (Number.isNaN(num)) return false
			return set(state, 'itemIndex', Math.round(num))
		case '/state/item/name':
			if (typeof v !== 'string') return false
			return set(state, 'itemName', v)
		case '/state/time':
			if (Number.isNaN(num)) return false
			return set(state, 'timeSeconds', num)
		case '/state/remaining':
			if (Number.isNaN(num)) return false
			return set(state, 'remainingSeconds', num)
		case '/state/hazards/armed':
			if (Number.isNaN(num)) return false
			return set(state, 'hazardsArmed', num !== 0)
		default:
			return false
	}
}

function set<K extends keyof AllStageState>(state: AllStageState, key: K, value: AllStageState[K]): boolean {
	if (state[key] === value) return false
	state[key] = value
	return true
}
