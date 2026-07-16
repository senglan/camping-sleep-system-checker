# Am I Warm?

A camping sleep-system calculator. Estimates the coldest temperature you'll comfortably sleep at from your bag rating, sleeping pad R-value, shelter, wind, conditions, layers, and whether you sleep warm or cold — and flags the weak link.

**Live:** https://senglan.github.io/camping-sleep-system-checker/

## How the estimate works

Starts from the bag's comfort rating, then shifts it warmer or colder for:

- **Pad R-value** vs. what the ground needs at that temperature (weighted most heavily)
- **Layers** worn to sleep
- **Shelter** type
- **Wind** exposure
- **Damp/wet** conditions
- **Warm/cold sleeper**

The result is compared to the forecast low to produce the margin and verdict. It's a rule-of-thumb estimate, not a lab measurement. All logic is in [`app.js`](app.js).

## Stack

Static HTML/CSS/JS, no build step or dependencies. Deployed on GitHub Pages.

## License

[MIT](LICENSE)
