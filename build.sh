#!/usr/bin/env bash
set -euo pipefail

echo R68_GIT_MIRROR_START
cat r68_00 r68_01 r68_02 r68_03 r68_04 r68_05 r68_06 r68_07 r68_08 r68_09 r68_10 r68_11 r68_12a r68_12b r68_13a r68_13b r68_14 > payload.b64
base64 -d payload.b64 > r68.tar.xz

echo "c6c62dd106ba63012dcc3be54a73c93f551148bbf56898039f094a4313efe9b3  r68.tar.xz" | sha256sum -c -
actual_size="$(stat -c%s r68.tar.xz)"
echo R68_GATE payload_size="$actual_size"
[ "$actual_size" = "76668" ]

rm -rf stage out
mkdir -p stage out
tar -xJf r68.tar.xz -C stage
stage_files="$(find stage -type f | wc -l | tr -d ' ')"
echo R68_GATE stage_files="$stage_files"
[ "$stage_files" = "54" ]

(cd stage && sha256sum -c ../r68_manifest.sha256)
echo R68_GATE manifest=PASS

grep -Eq '"release_id"[[:space:]]*:[[:space:]]*"R68"' stage/_release.json || { echo 'R68_GATE_FAIL release_id'; exit 1; }
grep -q 'e5c4554516dbc61e139d15b2e08508b7c7360894' stage/_release.json || { echo 'R68_GATE_FAIL release_head'; exit 1; }
grep -q '7ced4f5e1f4fa17b86d8f8faf1eedf2744ed52ca' stage/_release.json || { echo 'R68_GATE_FAIL release_tree'; exit 1; }
grep -q '569ce21a2db436332adb1133a856bb93ae773dd11c248d52af0943d8a22a7069' stage/_release.json || { echo 'R68_GATE_FAIL release_payload'; exit 1; }
echo R68_GATE release_metadata=PASS

find stage -mindepth 1 -maxdepth 1 ! -name vercel.json -exec cp -a {} out/ \;
output_files="$(find out -type f | wc -l | tr -d ' ')"
echo R68_GATE output_files="$output_files"
[ "$output_files" = "53" ] || { echo 'R68_GATE_FAIL output_count'; exit 1; }

echo R68_GIT_MIRROR_PASS stage_files=54 output_files=53 head=e5c4554516dbc61e139d15b2e08508b7c7360894 tree=7ced4f5e1f4fa17b86d8f8faf1eedf2744ed52ca payload_sha=569ce21a2db436332adb1133a856bb93ae773dd11c248d52af0943d8a22a7069
