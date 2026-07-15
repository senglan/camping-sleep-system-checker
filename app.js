/*
 * Will I Sleep Warm? — the estimate.
 *
 * The whole idea: a sleeping bag's comfort rating assumes an "ideal-ish" setup — a decent pad under
 * you, a base layer, calm air. Real nights aren't that. Cold ground robbing heat through a thin pad,
 * wind, damp gear, and just being a cold sleeper all push your *real* comfortable-to temperature up.
 * So we start from the bag rating and shift it by each of those factors, then compare to the forecast.
 *
 * Everything below is a transparent rule of thumb. Numbers are in °F. A shift that makes you able to
 * sleep COLDER (good) is negative; a shift that makes you cold sooner (bad) is positive.
 */

(function () {
  "use strict";

  var form = document.getElementById("checker");
  var out = document.getElementById("result");

  // How much pad R-value the ground realistically asks for at a given air temp.
  // ~1 at 50°F climbing to ~5.5 near -10°F. (Rule of thumb, not gospel.)
  function recommendedR(tempF) {
    var r = 1 + (50 - tempF) * 0.075;
    return Math.max(1, Math.min(6, r));
  }

  var SHELTER = {
    tent2:   { warmth: 5, label: "Enclosed double-wall tent" },
    tent1:   { warmth: 4, label: "Single-wall tent" },
    bivy:    { warmth: 4, label: "Bivy sack" },
    tarp:    { warmth: 1, label: "Tarp / floorless" },
    hammock: { warmth: 0, label: "Hammock" },
    cowboy:  { warmth: 0, label: "Cowboy camping" }
  };

  function num(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isNaN(v) ? null : v;
  }

  function sum(name) {
    var total = 0;
    form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) {
      total += parseFloat(el.value) || 0;
    });
    return total;
  }

  function radio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? parseFloat(el.value) || 0 : 0;
  }

  function fmt(n) {
    var r = Math.round(n);
    return (r > 0 ? "+" : "") + r + "°";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var forecastLow = num("forecastLow");
    var bagRating = num("bagRating");
    var padR = num("padR");

    if (forecastLow === null || bagRating === null || padR === null) {
      out.hidden = false;
      out.innerHTML = '<p class="err">Fill in the forecast low, your bag rating, and your pad R-value — those three do the heavy lifting.</p>';
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (padR < 0) padR = 0;

    var shelterKey = document.getElementById("shelter").value;
    var shelter = SHELTER[shelterKey];
    var windVal = parseFloat(document.getElementById("wind").value) || 0;
    var conditionsVal = parseFloat(document.getElementById("conditions").value) || 0;
    var clothing = sum("clothing");     // total warmth of extra layers (positive = warmer)
    var sleeperAdj = radio("sleeper");  // cold +8, average 0, warm -8

    // --- Build the shifts (positive = you'll get cold sooner) ---
    var shifts = [];

    // Sleeper type
    if (sleeperAdj !== 0) {
      shifts.push({ label: sleeperAdj > 0 ? "You sleep cold" : "You sleep warm", amt: sleeperAdj });
    }

    // Extra clothing helps (negative shift)
    if (clothing > 0) shifts.push({ label: "Extra layers you'll sleep in", amt: -clothing });

    // Shelter traps warmth (negative shift)
    if (shelter.warmth > 0) shifts.push({ label: shelter.label, amt: -shelter.warmth });

    // Pad vs. what the ground asks for
    var recR = recommendedR(forecastLow);
    var shortfall = Math.max(0, recR - padR);
    var surplus = Math.max(0, padR - recR);
    var padShift = shortfall * 5 - Math.min(surplus, 2) * 2; // penalize thin pads harder than we reward thick ones
    if (Math.abs(padShift) >= 0.5) {
      shifts.push({
        label: padShift > 0 ? "Pad too thin for the cold ground" : "Pad has R-value to spare",
        amt: padShift
      });
    }

    // Wind — worse when your shelter doesn't block it
    var windShift = windVal;
    var openToWind = (shelterKey === "tarp" || shelterKey === "cowboy" || shelterKey === "hammock");
    if (openToWind && windVal >= 5) windShift += 3;
    if (windShift > 0) shifts.push({ label: "Wind exposure", amt: windShift });

    // Hammocks lose heat underneath — a pad compresses and leaves gaps
    if (shelterKey === "hammock") shifts.push({ label: "Hammock (cold air under you)", amt: 5 });

    // Damp gear loses loft
    if (conditionsVal > 0) shifts.push({ label: "Damp / wet conditions", amt: conditionsVal });

    // --- Result ---
    var totalShift = shifts.reduce(function (a, s) { return a + s.amt; }, 0);
    var comfortLow = bagRating + totalShift;     // coldest temp you'll comfortably sleep
    var margin = forecastLow - comfortLow;        // + = forecast warmer than your limit (good)

    var verdict, cls, blurb;
    if (margin >= 10) {
      verdict = "You're set — with room to spare"; cls = "good";
      blurb = "Your setup should handle this night comfortably, with a genuine cushion if it gets colder than forecast.";
    } else if (margin >= 3) {
      verdict = "Should be comfortable"; cls = "good";
      blurb = "You're on the right side of the line. Not a huge margin, but you should sleep fine.";
    } else if (margin >= -3) {
      verdict = "Right at the edge"; cls = "warn";
      blurb = "This is a coin-flip night. You might be okay, but a few degrees colder than forecast and you'll feel it. Tighten up the weak link below.";
    } else if (margin >= -12) {
      verdict = "Expect a cold night"; cls = "bad";
      blurb = "Your setup is short for this forecast. You can probably get through it, but plan on being uncomfortable — and fix what you can.";
    } else {
      verdict = "Too cold — change your setup"; cls = "bad";
      blurb = "This is a real gap, not a rounding error. Don't count on toughing it out; add warmth before you go.";
    }

    // --- Recommendations, ordered by what's hurting most ---
    var recs = [];
    if (padShift >= 4) recs.push("Your pad is the weak link. Cold sinks through it faster than any layer can fix. Add a cheap closed-cell foam pad underneath (stacks on ~2 R-value) or bring a warmer pad.");
    if (conditionsVal >= 3) recs.push("Damp kills insulation. Vent your shelter to cut condensation, keep your bag off wet ground, and don't breathe into the bag.");
    if (windShift >= 5) recs.push("Wind is stripping your heat. Move to a sheltered spot, put your back to the wind, or build a simple wind break.");
    if (!hasClothing("Warm hat")) recs.push("Sleep in a warm hat. It's the cheapest few degrees you'll ever find — you lose a lot of heat from your head.");
    if (!hasClothing("liner")) recs.push("A sleeping-bag liner adds real warmth for a few ounces and keeps your bag cleaner.");
    if (shelterKey === "hammock") recs.push("In a hammock, get an underquilt. A pad alone compresses under you and leaves cold spots — this is the #1 hammock mistake.");
    if (margin < -3 && clothing < 6) recs.push("Wear your insulated jacket to bed. Dry puffy layers inside the bag are warmth you already packed.");
    if (margin >= 15) recs.push("You're actually over-built for this night — you could vent the bag or leave a layer home. Nice problem to have.");
    if (recs.length === 0) recs.push("Nothing glaring to fix. Keep a dry layer in reserve and you're in good shape.");

    render({
      verdict: verdict, cls: cls, blurb: blurb,
      comfortLow: comfortLow, forecastLow: forecastLow, margin: margin,
      shifts: shifts, bagRating: bagRating, recs: recs
    });

    // Analytics: did someone actually run a check, and roughly how did it land?
    if (typeof gtag === "function") {
      gtag("event", "run_check", {
        verdict: cls,
        margin_f: Math.round(margin),
        shelter: shelterKey
      });
    }
  });

  function hasClothing(text) {
    var labels = form.querySelectorAll(".check");
    for (var i = 0; i < labels.length; i++) {
      var input = labels[i].querySelector("input");
      if (input.checked && labels[i].textContent.toLowerCase().indexOf(text.toLowerCase()) !== -1) return true;
    }
    return false;
  }

  function render(r) {
    var breakdown = "";
    breakdown += row("Bag / quilt rating", r.bagRating, true);
    r.shifts.forEach(function (s) { breakdown += row(s.label, s.amt, false); });

    var recItems = r.recs.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

    out.hidden = false;
    out.innerHTML =
      '<div class="verdict ' + r.cls + '">' +
        '<h2>' + esc(r.verdict) + '</h2>' +
        '<p>' + esc(r.blurb) + '</p>' +
      '</div>' +
      '<div class="result-body">' +
        '<div class="numbers">' +
          '<div class="stat"><span class="k">You\'ll sleep comfortably to</span><span class="v">' + Math.round(r.comfortLow) + '°<small>F</small></span></div>' +
          '<div class="stat"><span class="k">Forecast low</span><span class="v">' + Math.round(r.forecastLow) + '°<small>F</small></span></div>' +
          '<div class="stat"><span class="k">Margin</span><span class="v">' + fmt(r.margin) + '<small>F</small></span></div>' +
        '</div>' +
        '<h3 class="sub">What went into that</h3>' +
        '<ul class="breakdown">' + breakdown + '</ul>' +
        '<h3 class="sub">What I\'d do</h3>' +
        '<ul class="recs">' + recItems + '</ul>' +
      '</div>';

    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function row(label, amt, isBase) {
    var cls = isBase ? "zero" : (amt < 0 ? "help" : (amt > 0 ? "hurt" : "zero"));
    var shown = isBase ? Math.round(amt) + "°F" : fmt(amt) + "F";
    return '<li><span>' + esc(label) + '</span><span class="amt ' + cls + '">' + shown + '</span></li>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
