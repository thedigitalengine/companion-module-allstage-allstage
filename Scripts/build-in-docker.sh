#!/bin/bash
# build-in-docker.sh - build, test and package this module with npm isolated
# from the host (founder 2026-10-24). Only this folder is mounted; the node
# image is pinned by digest; dependency scripts never run (--ignore-scripts);
# the build/test/package step has no network at all.
#
#     bash Scripts/build-in-docker.sh        -> the .tgz in this folder
#
# Needs a docker CLI with a running engine (the Intel: Colima, ~/.local/bin).
# To move the pin: docker pull node:26 && docker image inspect node:26
# --format '{{index .RepoDigests 0}}', then update NODE_IMAGE.
set -euo pipefail
NODE_IMAGE="node@sha256:a98e6fda54fdbb22d4238054cca9a2a113bcd1191c09193a535aae22f400aa8e"   # node:26, 2026-10-24
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN=(docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -e npm_config_update_notifier=false
     -v "$ROOT:/work" -w /work "$NODE_IMAGE")

echo "== install (network on, scripts off)"
"${RUN[@]}" npm ci --ignore-scripts --no-audit --no-fund
echo "== build + test + package (--network none)"
"${RUN[@]:0:2}" --network none "${RUN[@]:2}" sh -c 'npm run build && npm test && npm run package'
ls -la "$ROOT"/*.tgz
