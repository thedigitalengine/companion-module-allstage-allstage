import type ModuleInstance from './main.js'

export type VariablesSchema = {
	item_name: string
	item_index: number
	playing: string
	time: string
	time_s: number
	remaining: string
	remaining_s: number
	hazards_armed: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		item_name: { name: 'Current item name' },
		item_index: { name: 'Current item number (1-based, 0 = none)' },
		playing: { name: 'Transport state (PLAYING / STOPPED)' },
		time: { name: 'Position in the item (m:ss)' },
		time_s: { name: 'Position in the item (seconds)' },
		remaining: { name: 'Time remaining in the item (m:ss)' },
		remaining_s: { name: 'Time remaining in the item (seconds)' },
		hazards_armed: { name: 'Hazards (ARMED / SAFE)' },
	})
}
