import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	/** UDP port AllStage's State Feedback sends to; 0 = no feedback. */
	statePort: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'AllStage computer IP',
			width: 8,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'OSC input port (AllStage Settings > Protocols > OSC)',
			width: 4,
			min: 1,
			max: 65535,
			default: 8000,
		},
		{
			type: 'number',
			id: 'statePort',
			label: 'State feedback port (0 = off). In AllStage: Settings > Protocols > OSC > State Feedback, host = this computer, same port',
			width: 12,
			min: 0,
			max: 65535,
			default: 9100,
		},
	]
}
