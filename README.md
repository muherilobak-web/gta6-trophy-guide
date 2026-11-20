# Leonida Trophy Atlas

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muherilobak-web/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muherilobak-web/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on [make.fun](https://make.fun/r/bt57jd3y) (referral code `bt57jd3y`).

## What it is

A single-page static web app (`app/`, no build step, no network at run time):

- **Checklist** — all 55 trophies with official name, description and grade; tick them off, and progress saves in localStorage. Search, filters by kind (story / missable / collectibles / activities / platinum), grade and earned state, a spoiler setting that hides story trophies until earned, export/import of progress as JSON, and a per-trophy notes box.
- **Roadmap** — the platinum in four stages (story, stranger strands, counts and collections, open-world cleanup), each with a progress bar, plus the finish line: 100% completion and the platinum.
- **Missables** — the one trophy any community guide flags as possibly missable (Positive Mental Attitude, with the Chapter 1 moment to protect), plus the things that look missable but are not.
- **Next up** — a planner suggesting the next 5 easiest unearned trophies (shortest grind first, the flagged missable first), and your logged counts toward every counted trophy.
- **Detail pane** — click any trophy for its guide in our own words, its sources, a PSN count counter where it has one (for example 0 / 250 stunts), and your notes.
- **Keyboard** — `j`/`k` move, `space` toggles, `/` searches. Light and night themes.

## How the facts were checked

- Names, descriptions and grades are PlayStation's official list, checked live against Exophase on 20 November 2026: **no differences** from the list frozen 18 November.
- Hidden flags follow PSNProfiles / TrueTrophies (28 hidden); Push Square marks 27, counting Personal Best as visible. Earn rates shown are Exophase, 20 November 2026, about 7,300 tracked players.
- Every guide is written in our own words from the official description plus a cited source (Exophase; PowerPyx and Push Square as summarized by sixshore). Where no guide has confirmed a step yet — In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin — the guide says so instead of inventing a location.
- Only one trophy is flagged missable, because only one is flagged by any community guide (PowerPyx; Push Square lists none known). Story chapter and mission trophies are not flagged: missions are replayable and free roam continues after the story.
- There are no online trophies in the official list. Cheats disable trophies — keep them off your platinum run.

## Run it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

Open `app/index.html` in desktop Chrome. It works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
