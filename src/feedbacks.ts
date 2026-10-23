import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	playing: { type: 'boolean'; options: Record<string, never> }
	hazards_armed: { type: 'boolean'; options: Record<string, never> }
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	// Both need AllStage's State Feedback switched on (Settings > Protocols > OSC).
	self.setFeedbackDefinitions({
		playing: {
			type: 'boolean',
			name: 'AllStage is playing',
			options: [],
			defaultStyle: { bgcolor: 0x008000, color: 0xffffff },
			callback: () => self.state.playing,
		},
		hazards_armed: {
			type: 'boolean',
			name: 'Hazards are armed',
			options: [],
			defaultStyle: { bgcolor: 0xff6600, color: 0x000000 },
			callback: () => self.state.hazardsArmed,
		},
	} as never)
}
