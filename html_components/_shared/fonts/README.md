# Self-Hosted Fonts

The clips work offline using system fallbacks. For identical typography across machines,
add these licensed files here and declare them at the top of `_shared/theme.css`:

- `AvenirNext-Heavy.woff2` and `AvenirNext-Regular.woff2`
- `IBMPlexMono-Regular.woff2` and `IBMPlexMono-SemiBold.woff2`

Do not add a CDN import. Self-hosted files keep `file://` playback deterministic.
