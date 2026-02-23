## Packages
framer-motion | Page transitions and vault-opening animations for a premium feel
lucide-react | Icons for the UI

## Notes
- App is strictly dark mode.
- File uploads are converted to base64 on the client and stored in the `fileData` text column.
- The `useMessage` query is lazy-loaded (enabled only when the user clicks 'Reveal') to ensure the one-time read isn't triggered accidentally by prefetching.
