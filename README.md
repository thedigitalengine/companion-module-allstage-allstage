# companion-module-allstage-allstage

Bitfocus Companion module for AllStage (Stream Deck and other surfaces), sending OSC to AllStage's existing OSC input.

## AllStage setup
1. In AllStage enable the OSC input (Settings > Protocols > OSC). Default UDP port is 8000.
2. Make sure the transport commands you want are enabled there (each has its own switch).

## Commands (all existing AllStage OSC)
`/play` `/stop` `/pause` `/playstop` `/rewind` `/previous` `/next`, `/locate <seconds>`, `/song/select <n>` (1-based) or `<title>`, plus any cue-trigger address you assign in AllStage (action "Send cue trigger address").

## Not available
Also: `/hazards/kill`, `/lighting/blackout <0|1>`, `/lighting/grandmaster <0-1>`, `/lighting/look <name|n>`, `/master/volume <dB>`, `/playlist/select <n|name>`. Each has its own switch in AllStage Settings > Protocols > OSC > Remote Commands.

## State feedback (feedbacks and variables)
In AllStage Settings > Protocols > OSC > State Feedback: switch Send State on, set State Host to the computer running Companion and State Port to the module's "State feedback port" (default 9100). Gives feedbacks Playing and Hazards armed, and variables item_name, item_index, playing, time, time_s, remaining, remaining_s, hazards_armed. Changes are sent as they happen (time about 4 times a second) and everything is repeated every 5 seconds.

## Build and load
Needs Node 26. `npm install && npm test` (builds to `dist/`, runs the OSC encoder/decoder and state tests).
To load: `npm run package` produces a `.tgz`, import it in Companion (Modules > Import module package); or place this folder in Companion's developer modules folder and run `npm run build`.
