# Will I Sleep Warm?

A dead-simple checker for whether your camping sleep system will actually keep you warm tonight — and what to change if it won't.

**→ [Try it](https://senglan.github.io/camping-sleep-system-checker/)**

## Why I made this

I've lost enough nights to the cold to stop trusting the number printed on a sleeping bag. The rating on the tag assumes a good pad under you, a base layer, and calm air. Then you're out there on a 2.5 R-value pad, on frozen ground, with a breeze, wondering why a "20-degree bag" left you shivering at 34.

The pad is usually the culprit. Cold sinks *down* through you into the ground faster than almost anything, and no amount of puffy fixes a thin pad. So I wrote down the rules of thumb I'd picked up — pad R-value vs. temperature, wind, damp gear, whether you run hot or cold — and turned them into a thing I could check before a trip instead of learning the hard way at 3 a.m.

## What it does

You give it:

- Forecast overnight low
- Your bag/quilt **comfort** rating
- Your sleeping pad's R-value
- Shelter, wind exposure, and how damp it'll be
- What you'll actually sleep in, and whether you run warm or cold

It estimates the coldest temperature you'll sleep **comfortably** at, compares it to the forecast, and shows you the margin plus a plain-English breakdown of what's helping and what's hurting. Then it tells you the highest-value thing to fix.

## How the math works

It's rules of thumb, not a lab — and it's all in [`app.js`](app.js), commented, so you can argue with it:

- Start from the bag's comfort rating.
- Shift it warmer/colder for: pad R-value vs. what the ground asks for at that temp, extra layers, shelter type, wind, damp conditions, and cold/warm sleeper.
- Compare the result to the forecast low and turn the gap into a verdict.

The single most weighted factor is the pad, because in the field that's the one most people get wrong.

## Big honest disclaimer

This is an **estimate**. Bag ratings vary between brands and standards, and your body, altitude, hydration, and dinner all move the real number. When it's genuinely cold, being wrong is dangerous. Leave yourself a margin, carry a backup layer, and learn the signs of hypothermia. Don't let a green checkmark from a webpage talk you into a night you're not ready for.

## Contributing

If you've got better numbers — especially field-tested pad/temperature or liner data — open an issue or a PR. I'd rather this be right than be mine.

## License

[MIT](LICENSE) — do what you want with it.
