# HarflowDesktop

Read README.md and docs/architecture.md before editing. Preserve layer boundaries and existing work. Target files below 250 substantive lines and functions below 50 code lines; enforced maxima are 400 and 80. Run the documented checks before completion. Delegated workers follow their assigned scope and do not restart orchestration or review loops. Professional artifacts remain neutral.

## Ownership and interfaces

main owns application lifecycle, trusted sender checks and composition; preload owns the narrow runtime-validated host bridge; renderer owns the @harflow/ui adapter and React composition; shared owns browser-safe IPC value validation. Do not import another process layer or expose generic IPC, Node or persistence capabilities. Preserve sandbox and context isolation. Read docs/architecture.md for permitted edges.

## Test ownership

When unit tests are needed, the primary delegates them to the dedicated test_writer (gpt-6-luna, medium effort). That worker owns tests/ and coordinates production interfaces with the implementer. Preserve concurrent edits. Delegated workers do not restart the surrounding review workflow.
