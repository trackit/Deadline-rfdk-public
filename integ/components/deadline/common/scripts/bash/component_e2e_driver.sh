#!/bin/bash
#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Handle errors manually
set +e
# Fail on unset variables
set -u

COMPONENT_ROOT="$1"
COMPONENT_NAME=$(basename "$COMPONENT_ROOT")
START_TIME=$SECONDS

COMPONENT_E2E_ARG=""
if [[ "${DEV_MODE:-false}" == "true" ]]; then
  COMPONENT_E2E_ARG="--deploy-and-test-only"
fi

# Before changing directories, we determine the
# asbolute path of INTEG_TEMP_DIR, since it is a relative
# path
export INTEG_TEMP_DIR=$(readlink -fm "${INTEG_TEMP_DIR}")

cd "$INTEG_ROOT/$COMPONENT_ROOT"

# Ensure the component's artifact subdir exists
source "../common/scripts/bash/deploy-utils.sh"
ensure_component_artifact_dir "${COMPONENT_NAME}"

(
    set +e
    ../common/scripts/bash/component_e2e.sh "$COMPONENT_NAME" "$COMPONENT_E2E_ARG"
    exit_code=$?
    echo $exit_code > "${INTEG_TEMP_DIR}/${COMPONENT_NAME}/exitcode"
    exit $exit_code
)
test_exit_code=$?

FINISH_TIME=$SECONDS
cat > "${INTEG_TEMP_DIR}/${COMPONENT_NAME}/timings.sh" <<EOF
${COMPONENT_NAME}_START_TIME=${START_TIME}
${COMPONENT_NAME}_FINISH_TIME=${FINISH_TIME}
EOF

exit $test_exit_code
