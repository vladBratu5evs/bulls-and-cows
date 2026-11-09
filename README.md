# bulls-and-cows

## Run the game

Run `npm run build`, then serve the project root with a static file server and
open `index.html`. The game supports secret lengths from 2 to 6 and binary,
octal, decimal, and hexadecimal digits. Completed scores are ranked in a
10-entry leaderboard stored in the browser's local storage.

## Deploy to GitHub Pages

The `Deploy GitHub Pages` workflow builds the TypeScript app and publishes
`index.html`, `styles.css`, and the generated `dist/` files whenever changes
are pushed to the `bulls-and-cows` branch. In the repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.
