<div align="center">

# crontab.help

**Decode any cron expression instantly. See plain English, next run times, and a shareable link.**

[![MIT License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-51%20passing-22c55e?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-3b82f6?style=flat-square)](https://github.com/Panchak2d/crontab-help/issues)

**[→ Open the tool](https://panchak2d.github.io/crontab-help/)**

</div>

---

## What it does

You have a cron expression like `0 */4 * * 1-5`. You need to know:

- What does this actually mean in plain English?
- When does it run next?
- Is it correct before I push it to production?

Paste it in. Get answers immediately. No account. No install. Runs entirely in your browser.

---

## Supported formats

| Format | Fields | Used by |
|---|---|---|
| **Unix / Linux** | `min hour dom month dow` | crontab, systemd timers, most Linux schedulers |
| **GitHub Actions** | `min hour dom month dow` | `.github/workflows/*.yml` `schedule:` triggers |
| **Quartz Scheduler** | `sec min hour dom month dow` | Spring `@Scheduled`, Quartz, AWS Lambda |
| **AWS EventBridge** | `min hour dom month dow year` | CloudWatch Events, EventBridge rules |

Switch formats using the tabs above the input — field labels and ranges update automatically.

---

## How to use it

**1. Type or paste your expression** into the input at the top.

```
0 */4 * * 1-5
```

**2. Read the plain-English description** directly below the input.

```
At 00:00, every 4 hours, Monday through Friday
```

**3. Click any field** in the expression to highlight it in the field breakdown and see its allowed range.

**4. Check the next run times** in the left panel. Use the dropdown to switch timezones.

**5. Pick a preset** from the right panel to instantly populate the editor with a common schedule.

**6. Share your expression** — click **Share** to copy the URL. The expression is encoded in the link itself, so anyone who opens it sees the same expression immediately.

---

## Common expressions

| Expression | Means |
|---|---|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour, on the hour |
| `0 9 * * *` | Daily at 09:00 |
| `0 9 * * 1-5` | Weekdays at 09:00 (Mon–Fri) |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First of every month at midnight |
| `0 0 1 1 *` | Once a year, 1st January |

---

## Special characters

| Character | Meaning | Example |
|---|---|---|
| `*` | Any value | `* * * * *` — every minute |
| `*/n` | Every n units | `*/15 * * * *` — every 15 minutes |
| `a-b` | Range | `1-5` — Monday through Friday |
| `a,b,c` | List | `1,3,5` — Mon, Wed, Fri |
| `L` | Last | Last day of the month (Quartz/AWS) |
| `W` | Nearest weekday | `15W` — nearest weekday to the 15th |
| `#` | Nth weekday | `2#1` — first Monday of the month |
| `?` | No specific value | Used in dom or dow when the other is set (Quartz/AWS) |

---

## Why this instead of crontab.guru?

crontab.guru only supports Unix 5-field cron. crontab.help also supports:

- **GitHub Actions** — test your workflow schedule before you push
- **AWS EventBridge** — validate CloudWatch/EventBridge rules with the year field
- **Quartz Scheduler** — 6-field format used by Spring and AWS Lambda

Plus shareable links — paste a URL into a PR comment so your reviewer can see exactly what your schedule does.

---

## Contributing

All contributions are welcome.

**Add a preset** — edit [`src/utils/constants.ts`](src/utils/constants.ts), add one object to `CRON_PRESETS`:

```ts
{ label: 'Every 10 minutes', expression: '*/10 * * * *', format: 'unix', description: 'Runs every 10 minutes' }
```

**Add a timezone** — add a string to the `TIMEZONES` array in the same file.

**Report a bug** — open an [issue](https://github.com/Panchak2d/crontab-help/issues) and include the expression that misbehaved.

```bash
git clone https://github.com/Panchak2d/crontab-help
cd crontab-help
npm install
npm run dev      # http://localhost:5173
npm test         # 51 unit tests
npm run build    # production build
```

---

## Tech stack

[React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Vite](https://vite.dev) · [cron-parser 5](https://www.npmjs.com/package/cron-parser) · [cronstrue 3](https://www.npmjs.com/package/cronstrue) · Zero backend · Free on GitHub Pages

---

## License

MIT — free to use, fork, embed, and self-host.
