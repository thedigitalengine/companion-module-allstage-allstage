import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { createSocket, type Socket } from 'node:dgram'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { decodeOsc, encodeOsc, type OscArg } from './osc.js'
import { applyStateMessage, formatClock, initialState, type AllStageState } from './state.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig
	private socket?: Socket
	private stateSocket?: Socket
	state: AllStageState = initialState()

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.openSocket()
		this.openStateSocket()
		UpdateActions(this)
		UpdateFeedbacks(this)
		UpdatePresets(this)
		UpdateVariableDefinitions(this)
		this.publishState()
	}

	async destroy(): Promise<void> {
		this.socket?.close()
		this.socket = undefined
		this.stateSocket?.close()
		this.stateSocket = undefined
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.openSocket()
		this.openStateSocket()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private openSocket(): void {
		this.socket?.close()
		this.socket = createSocket('udp4')
		this.socket.on('error', (e) => this.updateStatus(InstanceStatus.UnknownError, e.message))
		// UDP is connectionless: Ok means "configured", not "AllStage is listening".
		this.updateStatus(this.config.host ? InstanceStatus.Ok : InstanceStatus.BadConfig)
	}

	/** Listen for AllStage's State Feedback (OSC over UDP) on config.statePort; 0 = off. */
	private openStateSocket(): void {
		this.stateSocket?.close()
		this.stateSocket = undefined
		this.state = initialState()
		this.publishState()
		const port = Math.round(Number(this.config.statePort) || 0)
		if (port <= 0) return
		const sock = createSocket({ type: 'udp4', reuseAddr: true })
		sock.on('error', (e) => this.updateStatus(InstanceStatus.UnknownError, `State port ${port}: ${e.message}`))
		sock.on('message', (buf) => {
			const msg = decodeOsc(buf)
			if (msg && applyStateMessage(this.state, msg)) this.publishState()
		})
		sock.bind(port)
		this.stateSocket = sock
	}

	private publishState(): void {
		const s = this.state
		this.setVariableValues({
			item_name: s.itemName,
			item_index: s.itemIndex,
			playing: s.playing ? 'PLAYING' : 'STOPPED',
			time: formatClock(s.timeSeconds),
			time_s: Math.round(s.timeSeconds * 10) / 10,
			remaining: formatClock(s.remainingSeconds),
			remaining_s: Math.round(s.remainingSeconds * 10) / 10,
			hazards_armed: s.hazardsArmed ? 'ARMED' : 'SAFE',
		})
		this.checkFeedbacks('playing', 'hazards_armed')
	}

	sendOsc(address: string, args: OscArg[] = []): void {
		if (!this.socket || !this.config.host) return
		this.socket.send(encodeOsc(address, args), this.config.port || 8000, this.config.host, (err) => {
			if (err) this.log('error', `OSC send failed: ${err.message}`)
		})
	}
}
