# Kinetic Grid Clock — Reference

**Project**: erudit0rum — 84 mini-clocks (6 rows × 14 columns), inspired by Humans Since 1982 *A Million Times*.

---

## Architecture

### Grid layout (14 cols)
```
[digit H-tens 3 cols][digit H-units 3 cols][colon 2 cols][digit M-tens 3 cols][digit M-units 3 cols]
```

### 30s cycle
| Window | Duration | Phase |
|--------|----------|-------|
| 0 → 2s | 2s | Reverse ease: time display → pattern |
| 2s → 23s | 21s | 4 blended patterns |
| 23s → 25s | 2s | Forward ease: pattern → time display |
| 25s → 30s | 5s | Static time display |

Between patterns, hands crossfade over a 1.2s blend window. Both ease transitions use an ease-in-out curve (`x < 0.5 ? 2x² : 1−(−2x+2)²/2`).

### Modes
- **clock** — shows `HH:MM` (UTC + configurable offset). Default mode.
- **countdown** — shows `MM:SS` counting down from a stored end timestamp. Freezes on `00:00` with a pulsating red glow ("danger time") until reset via controls.

Settings persisted in `localStorage`: `clk_mode`, `clk_hours`, `clk_countdown_time`, `clk_countdown_end`.

### CSS colour tokens (`styles/clock.css`)
| Variable | Default | Purpose |
|----------|---------|---------|
| `--clk-bg` | `#050505` | Page background |
| `--clk-face` | `#0e0e0e` | Clock face fill |
| `--clk-border` | `rgba(255,255,255,0.04)` | Clock circle border |
| `--clk-hand` | `#4f001e` | Hand colour |
| `--clk-zero-hand` | `#ff2020` | Hand colour at countdown zero |
| `--clk-zero-glow` | `rgba(255,32,32,0.45)` | Glow at countdown zero |

### Patterns (4 choreographies in `js/clock.js`)
| Index | Style |
|-------|-------|
| 0 | Concentric ripple (elliptical atan2, rotating) |
| 1 | Diagonal wave (linear phase across grid) |
| 2 | Radial V (circular atan2, spread oscillates) |
| 3 | Vortex (radial distance + rotation, spread oscillates) |

---

## Digit Reference

Each digit occupies a **3-column × 6-row** sub-grid of analog clock faces.
Position notation: `H:M` where hour hand = H×30° and minute hand = M×6°.

## Angle key

| Notation  | Hands     | Shape | JS const |
|-----------|-----------|-------|----------|
| `3:45`    | →←        | ─     | `H`      |
| `12:30`   | ↑↓        | │     | `V`      |
| `6:15`    | ↓→        | ┌     | `TL`     |
| `9:30`    | ↓←        | ┐     | `TR`     |
| `12:15`   | ↑→        | └     | `BL`     |
| `12:45`   | ↑←        | ┘     | `BR`     |
| `6:30`    | ↓↓        | ·̣     | `I_D` (interior, both down) |
| `12:00`   | ↑↑        | ·     | `I_U` (interior, both up)   |
| `1:7.5`   | ↗↗        | ╱     | `NE`     |
| `10:52.5` | ↖↖        | ╲     | `NW`     |
| `4:22.5`  | ↘↘        | ╲     | `SE`     |
| `7:37.5`  | ↙↙        | ╱     | `SW`     |

---

## Digit 0

```
┌ ─ ┐   TL,  H,   TR
│ · │   V,   I_D, V
│ │ │   V,   V,   V
│ │ │   V,   V,   V
│ · │   V,   I_U, V
└ ─ ┘   BL,  H,   BR
```

---

## Digit 1

```
┌ ─ ┐   TL,  H,   TR
└ ┐ │   BL,  TR,  V
╱ │ │   SW,  V,   V
╱ │ │   SW,  V,   V
╱ │ │   SW,  V,   V
╱ └ ┘   SW,  BL,  BR
```

---

## Digit 2

```
┌ ─ ┐   TL,  H,   TR
└ ┐ │   BL,  TR,  V
┌ ┘ │   TL,  BR,  V
│ ┌ ┘   V,   TL,  BR
│ └ ┐   V,   BL,  TR
└ ─ ┘   BL,  H,   BR
```

---

## Digit 3

```
┌ ─ ┐   TL,  H,   TR
└ ┐ │   BL,  TR,  V
┌ ┘ │   TL,  BR,  V
└ ┐ │   BL,  TR,  V
┌ ┘ │   TL,  BR,  V
└ ─ ┘   BL,  H,   BR
```

---

## Digit 4

```
┌ ┐ ┐   TL,  TR,  TR
│ │ │   V,   V,   V
│ · │   V,   I_U, V
└ ┐ │   BL,  TR,  V
╱ │ │   SW,  V,   V
╱ └ ┘   SW,  BL,  BR
```

---

## Digit 5  *(digit 2 mirrored horizontally)*

```
┌ ─ ┐   TL,  H,   TR
│ ┌ ┘   V,   TL,  BR
│ └ ┐   V,   BL,  TR
└ ┐ │   BL,  TR,  V
┌ ┘ │   TL,  BR,  V
└ ─ ┘   BL,  H,   BR
```

---

## Digit 6  *(digit 9 mirrored vertically + horizontally)*

```
┌ ─ ┐   TL,  H,   TR
│ ┌ ┘   V,   TL,  BR
│ └ ┐   V,   BL,  TR
│ · │   V,   I_D, V
│ · │   V,   I_U, V
└ ─ ┘   BL,  H,   BR
```

---

## Digit 7

```
┌ ─ ┐   TL,  H,   TR
└ ╱ │   BL,  NE,  V
╲ ╱ ╱   NW,  NE,  SW
╱ ╱ ╲   NE,  NE,  SE
│ │ ╲   V,   V,   SE
└ ┘ ╲   BL,  BR,  SE
```

---

## Digit 8

```
┌ ─ ┐   TL,  H,   TR
│ · │   V,   I_D, V
╲ · ╱   SE,  I_U, SW
╱ · ╲   NE,  I_D, NW
│ · │   V,   I_U, V
└ ─ ┘   BL,  H,   BR
```

---

## Digit 9

```
┌ ─ ┐   TL,  H,   TR
│ · │   V,   I_D, V
│ · │   V,   I_U, V
└ ┐ │   BL,  TR,  V
┌ ┘ │   TL,  BR,  V
└ ─ ┘   BL,  H,   BR
```
