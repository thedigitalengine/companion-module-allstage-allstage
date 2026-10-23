import type ModuleInstance from './main.js'
import type { ModuleSchema } from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

const buttons: Array<[string, string, string, number, Record<string, unknown>?]> = [
	['play', 'PLAY', 'play', 0x008000],
	['stop', 'STOP', 'stop', 0xaa0000],
	['playstop', 'PLAY /\\nSTOP', 'playstop', 0x004080],
	['pause', 'PAUSE', 'pause', 0x806000],
	['rewind', 'REWIND', 'rewind', 0x333333],
	['previous', 'PREV', 'previous', 0x333333],
	['next', 'NEXT', 'next', 0x333333],
]

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	const ids: string[] = []
	for (const [id, text, action, bg] of buttons) {
		ids.push(id)
		presets[id] = {
			type: 'simple',
			name: text.replace('\\n', ' '),
			style: { text, size: 'auto', color: 0xffffff, bgcolor: bg, show_topbar: false },
			steps: [{ down: [{ actionId: action, options: {} }], up: [] }],
			feedbacks: action === 'play' ? [{ feedbackId: 'playing', options: {}, style: { bgcolor: 0x00cc00, color: 0x000000 } }] : [],
		} as never
	}
	for (let n = 1; n <= 8; n++) {
		const id = `item${n}`
		ids.push(id)
		presets[id] = {
			type: 'simple',
			name: `Go to item ${n}`,
			style: { text: `GO\\n${n}`, size: 'auto', color: 0xffffff, bgcolor: 0x202040, show_topbar: false },
			steps: [{ down: [{ actionId: 'song_select', options: { index: n } }], up: [] }],
			feedbacks: [],
		} as never
	}
	const simplePreset = (id: string, name: string, text: string, bg: number, action: string, options: Record<string, unknown>, feedbacks: unknown[] = [], size: string = 'auto') => {
		presets[id] = {
			type: 'simple',
			name,
			style: { text, size, color: 0xffffff, bgcolor: bg, show_topbar: false },
			steps: [{ down: [{ actionId: action, options }], up: [] }],
			feedbacks,
		} as never
	}
	simplePreset('hazards_kill', 'Hazards KILL', 'KILL', 0xcc0000, 'hazards_kill', {}, [], '24')
	simplePreset('hazards_status', 'Hazards armed indicator (press = KILL)', 'HAZARDS\\n$(allstage:hazards_armed)', 0x333333, 'hazards_kill', {}, [
		{ feedbackId: 'hazards_armed', options: {}, style: { bgcolor: 0xff6600, color: 0x000000 } },
	])
	simplePreset('blackout_on', 'Blackout on', 'BLACK\\nOUT', 0x000000, 'blackout', { state: '1' })
	simplePreset('blackout_off', 'Blackout off', 'LIGHTS\\nBACK', 0x444400, 'blackout', { state: '0' })
	simplePreset('gm_full', 'Grand master 100%', 'GM\\n100%', 0x404040, 'grandmaster', { percent: 100 })
	simplePreset('gm_half', 'Grand master 50%', 'GM\\n50%', 0x404040, 'grandmaster', { percent: 50 })
	simplePreset('gm_zero', 'Grand master 0%', 'GM\\n0%', 0x404040, 'grandmaster', { percent: 0 })
	simplePreset('master_unity', 'Master volume 0 dB', 'MASTER\\n0 dB', 0x404040, 'master_volume', { db: 0 })
	simplePreset('master_down', 'Master volume -12 dB', 'MASTER\\n-12 dB', 0x404040, 'master_volume', { db: -12 })
	simplePreset('look1', 'Fire look 1', 'LOOK\\n1', 0x402040, 'look', { look: '1' })
	simplePreset('now_playing', 'Now playing (item, time, remaining)', '$(allstage:item_index). $(allstage:item_name)\\n$(allstage:time) / -$(allstage:remaining)', 0x101010, 'playstop', {}, [
		{ feedbackId: 'playing', options: {}, style: { bgcolor: 0x006000, color: 0xffffff } },
	], '14')

	const structure: CompanionPresetSection[] = [
		{
			id: 'transport',
			name: 'Transport',
			definitions: [
				{
					id: 'transport_buttons',
					name: 'Transport',
					type: 'simple',
					presets: ids.slice(0, buttons.length),
				},
			],
		},
		{
			id: 'lighting',
			name: 'Lighting, hazards and master',
			definitions: [
				{ id: 'safety', name: 'Hazards', type: 'simple', presets: ['hazards_kill', 'hazards_status'] },
				{
					id: 'lights',
					name: 'Lighting',
					type: 'simple',
					presets: ['blackout_on', 'blackout_off', 'gm_full', 'gm_half', 'gm_zero', 'look1'],
				},
				{ id: 'master', name: 'Master volume', type: 'simple', presets: ['master_unity', 'master_down'] },
			],
		},
		{
			id: 'status',
			name: 'Status (needs State Feedback)',
			definitions: [{ id: 'now', name: 'Now playing', type: 'simple', presets: ['now_playing'] }],
		},
		{
			id: 'items',
			name: 'Setlist',
			definitions: [
				{ id: 'goto', name: 'Go to item', type: 'simple', presets: ids.slice(buttons.length) },
			],
		},
	]
	self.setPresetDefinitions(structure, presets)
}
