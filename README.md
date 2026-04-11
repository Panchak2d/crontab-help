<div align="center">

# crontab.help

**The open-source cron expression editor that actually explains what your cron does.**

[![MIT License](https://img.shields.io/badge/license-MIT-3fb950?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-43%20passing-3fb950?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-388bfd?style=flat-square)](CONTRIBUTING.md)

**[→ Open crontab.help](https://Panchak2d.github.io/crontab-help)**

</div>

---

## What is it?

Cron expressions are powerful but cryptic. `0 */4 * * 1-5` — what does that actually run? When does it run next?

**crontab.help** translates any cron expression into plain English, shows you the next 10 scheduled run times in your timezone, and explains each field as you type. No account. No backend. Runs entirely in your browser.

---

## Features

| | |
|---|---|
| **Plain-English description** | `*/5 * * * *` → "Every 5 minutes" — instantly, as you type |
| **Next 10 run times** | Exact datetimes in your chosen timezone |
| **Field explainer** | Click any part of your expression to see what it controls |
| **4 cron formats** | Unix, Quartz (Spring / AWS Lambda), GitHub Actions, AWS EventBridge |
| **20+ presets** | One click to populate common schedules |
| **Shareable links** | Every expression is encoded in the URL — copy and share with no backend |

---

## How to use it

**1. Type your cron expression** into the big input box at the top.

```
*/30 * * * *
```

The description updates instantly. A green border means valid. Red means something is wrong.

**2. Read the description** — shown directly below the input in plain English.

```
Every 30 minutes
```

**3. Check the field explainer** — five (or six) pills below the description, one per field. Click anywhere in your expression to highlight the field your cursor is in and see its allowed range.

```
*/30    *      *           *       *
MINUTE  HOUR   DAY(MONTH)  MONTH   DAY(WEEK)
0–59    0–23   1–31        1–12    0–7
```

**4. See the next 10 run times** — in the left panel. Use the dropdown to switch timezones.

```
#1   Fri, Apr 11, 2026, 14:00:00   in 4m
#2   Fri, Apr 11, 2026, 14:30:00   in 34m
...
```

**5. Use a preset** — click any entry in the right panel to instantly populate the editor with a common expression.

**6. Share your expression** — click the **Share** button in the header. The URL already contains your expression (base64-encoded in the hash) — anyone with the link sees the same expression immediately, no account needed.

---

## Supported cron formats

| Format | Fields | Used by |
|---|---|---|
| **Unix / Linux** | `min hour dom month dow` | crontab, systemd, most schedulers |
| **Quartz** | `sec min hour dom month dow` | Spring `@Scheduled`, Quartz Scheduler, AWS Lambda |
| **GitHub Actions** | `min hour dom month dow` | `.github/workflows/*.yml` schedule triggers |
| **AWS EventBridge** | `min hour dom month dow year` | CloudWatch Events, EventBridge rules |

Switch between formats using the tabs above the input. The field labels and ranges update automatically.

---

## Common expressions

| Expression | Means |
|---|---|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour, on the hour |
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9 * * 1-5` | Weekdays at 9:00 AM (Mon–Fri) |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First of every month at midnight |
| `0 0 1 1 *` | Once a year, January 1st at midnight |

---

## Special characters

| Character | Meaning | Example |
|---|---|---|
| `*` | Any value | `* * * * *` — every minute |
| `*/n` | Every n units | `*/15 * * * *` — every 15 minutes |
| `a-b` | Range | `1-5` — Monday through Friday |
| `a,b,c` | List | `1,3,5` — Monday, Wednesday, Friday |
| `L` | Last | `L` in day-of-month — last day of month |
| `W` | Nearest weekday | `15W` — nearest weekday to the 15th |
| `#` | Nth occurrence | `2#1` — first Monday of the month |
| `?` | No specific value (Quartz/AWS) | Use in dom or dow when the other is specified |

---

## Contributing

Contributions are welcome. The easiest ways to help:

**Add a preset** — edit [`src/utils/constants.ts`](src/utils/constants.ts), add one line to `CRON_PRESETS`:
```ts
{ label: 'Every 10 minutes', expression: '*/10 * * * *', format: 'unix', description: 'Runs every 10 minutes' }
```

**Add a timezone** — add a string to the `TIMEZONES` array in the same file.

**Report a bug** — open an [issue](https://github.com/Panchak2d/crontab-help/issues) with the expression that behaved unexpectedly.

**Improve the UI** — the CSS design system lives in [`src/index.css`](src/index.css) and uses CSS custom properties throughout — easy to fork and retheme.

```bash
git clone https://github.com/Panchak2d/crontab-help
cd crontab-help
npm install
npm run dev      # http://localhost:5173
npm test         # 43 unit tests
```

---

## Tech stack

Built with [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev), [cron-parser](https://www.npmjs.com/package/cron-parser), and [cronstrue](https://www.npmjs.com/package/cronstrue). Zero backend. Deploys for free on GitHub Pages.

---

## License

MIT — free to use, fork, embed, and self-host.
