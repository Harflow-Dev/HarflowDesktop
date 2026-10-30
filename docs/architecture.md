# Architecture

main owns lifecycle and adapter composition; preload exposes a single named validated host-information operation; renderer composes the shared UI application port. shared contains only IPC value validators. No process layer imports another process layer. Main/preload are bundled CommonJS, renderer is bundled by Vite. The sandboxed preload has no unbundled local requires. Context isolation and sandbox are enabled, Node integration disabled. Main validates exact trusted URL/main frame and payload; preload validates results. Navigation, new windows and permissions are denied. Production CSP denies network. No sibling source imports are permitted.

Target files below 250 substantive lines and functions below 50 code lines. Enforced production maxima are 400 and 80. Changes must preserve constructor injection, explicit errors and bounded work. No compatibility or migration claim follows from a successful build.

The source inventory rejects unknown layers, source symlinks and unsupported production file types. Resolved local imports stay inside known src layers; external repository/private source paths cannot relay around layer rules. Unit tests are typechecked and linted with test-only syntax allowances.

Main and preload use ES/Node libraries without DOM; renderer has DOM libraries with no ambient Node types. Shared values use ES-only types. Graph checks deny Node built-ins in shared and restrict sandbox preload built-ins to Electron/events/timers/url.
