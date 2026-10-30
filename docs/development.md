# Development

Run from this repository, independently of sibling checkouts.

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run architecture
npm run test
npm run build
npm run smoke
```

CI runs static checks, build and tests on macOS, Linux and Windows. Local checks do not establish hosted CI success. No publication or release workflow is installed.

Node 24 and npm 11 are required. Native production Electron smoke runs on macOS only; Linux/Windows boot is not qualified. Never disable the sandbox for validation. The smoke checks the actual bundled preload, validated bridge and rendered status; it is not visual design approval.

The HarflowUI dependency is pinned to an exact reviewed Git commit in package.json and package-lock.json. Installation is independent of sibling checkouts and requires Git, network access and build tooling for the package's prepare script. The source commit is pinned; the lockfile does not integrity-hash the resulting built output. Update the dependency and lockfile together, then run the full checks and production smoke. Registry publication is separate work.

After updating the pin with npm install, verify that the lockfile's resolved URL remains HTTPS; npm may normalize GitHub dependencies to SSH. Use npm ci for frozen installs.
