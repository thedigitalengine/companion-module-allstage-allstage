import type ModuleInstance from './main.js'

export type ActionsSchema = {
	play: { options: Record<string, never> }
	stop: { options: Record<string, never> }
	pause: { options: Record<string, never> }
	playstop: { options: Record<string, never> }
	rewind: { options: Record<string, never> }
	previous: { options: Record<string, never> }
	next: { options: Record<string, never> }
	locate: { options: { seconds: number } }
	song_select: { options: { index: number } }
	song_select_name: { options: { title: string } }
	custom_cue: { options: { address: string } }
	hazards_kill: { options: Record<string, never> }
	blackout: { options: { state: string } }
	grandmaster: { options: { percent: number } }
	look: { options: { look: string } }
	master_volume: { options: { db: number } }
	playlist_select: { options: { index: number } }
	playlist_select_name: { options: { title: string } }
}

const simple: Array<[keyof ActionsSchema, string, string]> = [
	['play', 'Play', '/play'],
	['stop', 'Stop', '/stop'],
	['pause', 'Pause', '/pause'],
	['playstop', 'Play / Stop toggle', '/playstop'],
	['rewind', 'Rewind', '/rewind'],
	['previous', 'Previous item', '/previous'],
	['next', 'Next item', '/next'],
]

export function UpdateActions(self: ModuleInstance): void {
	const defs: Record<string, unknown> = {}
	for (const [id, name, addr] of simple) {
		defs[id] = { name, options: [], callback: async () => self.sendOsc(addr) }
	}
	defs.locate = {
		name: 'Locate to position (seconds)',
		options: [{ id: 'seconds', type: 'number', label: 'Seconds', default: 0, min: 0, max: 86400 }],
		callback: async (e: { options: { seconds: number } }) => self.sendOsc('/locate', [Number(e.options.seconds)]),
	}
	defs.song_select = {
		name: 'Go to item number (1-based)',
		options: [{ id: 'index', type: 'number', label: 'Item number', default: 1, min: 1, max: 9999 }],
		callback: async (e: { options: { index: number } }) =>
			self.sendOsc('/song/select', [Math.max(1, Math.round(Number(e.options.index)))]),
	}
	defs.song_select_name = {
		name: 'Go to item by title',
		options: [{ id: 'title', type: 'textinput', label: 'Title (exact)', default: '' }],
		callback: async (e: { options: { title: string } }) => {
			if (e.options.title) self.sendOsc('/song/select', [e.options.title])
		},
	}
	defs.custom_cue = {
		name: 'Send cue trigger address',
		description: 'Fires a cue trigger you have assigned an OSC address to inside AllStage, e.g. /cue/boom',
		options: [{ id: 'address', type: 'textinput', label: 'OSC address', default: '/cue/' }],
		callback: async (e: { options: { address: string } }) => self.sendOsc(e.options.address.trim()),
	}
	defs.hazards_kill = {
		name: 'Hazards KILL',
		description: 'Same as the console KILL: disarms hazards and ends any test fire.',
		options: [],
		callback: async () => self.sendOsc('/hazards/kill'),
	}
	defs.blackout = {
		name: 'Lighting blackout',
		options: [
			{
				id: 'state',
				type: 'dropdown',
				label: 'Blackout',
				default: '1',
				choices: [
					{ id: '1', label: 'On' },
					{ id: '0', label: 'Off' },
				],
			},
		],
		callback: async (e: { options: { state: string } }) =>
			self.sendOsc('/lighting/blackout', [e.options.state === '0' ? 0 : 1]),
	}
	defs.grandmaster = {
		name: 'Lighting grand master (%)',
		options: [{ id: 'percent', type: 'number', label: 'Level %', default: 100, min: 0, max: 100 }],
		callback: async (e: { options: { percent: number } }) =>
			self.sendOsc('/lighting/grandmaster', [Math.min(1, Math.max(0, Number(e.options.percent) / 100))]),
	}
	defs.look = {
		name: 'Fire lighting look',
		description: 'Look name, or its number in the look library (1-based)',
		options: [{ id: 'look', type: 'textinput', label: 'Look name or number', default: '1' }],
		callback: async (e: { options: { look: string } }) => {
			const v = String(e.options.look).trim()
			if (!v) return
			self.sendOsc('/lighting/look', [/^\d+$/.test(v) ? Number.parseInt(v, 10) : v])
		},
	}
	defs.master_volume = {
		name: 'Master volume (dB)',
		description: 'Sets the master fader, -100 to +12 dB (0 = unity)',
		options: [{ id: 'db', type: 'number', label: 'dB', default: 0, min: -100, max: 12 }],
		callback: async (e: { options: { db: number } }) => self.sendOsc('/master/volume', [Number(e.options.db)]),
	}
	defs.playlist_select = {
		name: 'Select playlist item by number (1-based)',
		options: [{ id: 'index', type: 'number', label: 'Item number', default: 1, min: 1, max: 9999 }],
		callback: async (e: { options: { index: number } }) =>
			self.sendOsc('/playlist/select', [Math.max(1, Math.round(Number(e.options.index)))]),
	}
	defs.playlist_select_name = {
		name: 'Select playlist item by title',
		options: [{ id: 'title', type: 'textinput', label: 'Title', default: '' }],
		callback: async (e: { options: { title: string } }) => {
			if (e.options.title) self.sendOsc('/playlist/select', [e.options.title])
		},
	}
	self.setActionDefinitions(defs as never)
}
