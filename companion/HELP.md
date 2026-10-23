# AllStage

Controls AllStage live-performance software from Companion (Stream Deck and other surfaces) over OSC.

## Setting up AllStage
1. Open AllStage Settings > Protocols > OSC and switch the OSC input on. The default UDP port is 8000.
2. Set the module's Host to the computer running AllStage and Port to the same port.
3. Make sure each command you want to use is switched on; every command has its own switch.

## Transport and navigation
`/play` `/stop` `/pause` `/playstop` `/rewind` `/previous` `/next`, `/locate <seconds>`, `/song/select <n>` (1-based) or `<title>`, plus any cue-trigger address you assign in AllStage (action "Send cue trigger address").

## Remote Commands
Enable these in AllStage Settings > Protocols > OSC > Remote Commands: `/hazards/kill`, `/lighting/blackout <0|1>`, `/lighting/grandmaster <0-1>`, `/lighting/look <name|n>`, `/master/volume <dB>`, `/playlist/select <n|name>`.

## State Feedback
In AllStage Settings > Protocols > OSC > State Feedback, switch Send State on, set State Host to the computer running Companion and State Port to the module's "State feedback port" (default 9100).

Feedbacks: Playing, Hazards armed.
Variables: item_name, item_index, playing, time, time_s, remaining, remaining_s, hazards_armed.

Changes are sent as they happen (time about four times a second) and everything is repeated every five seconds.

Support: https://allstage.io/support
