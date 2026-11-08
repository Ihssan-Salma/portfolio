# Add Salma’s own narration

No narration, music or sound effects are supplied. The site currently plays a captioned **silent edition**, with sound controls disabled. It never synthesizes your voice or implies that a recording exists.

## Files to provide

Place your own recordings beside this document:

- `trailer-fr.mp3` — French, exactly **85 seconds**.
- `trailer-en.mp3` — English, exactly **85 seconds**.

These are ordinary static files: the URLs are `public/audio/trailer-fr.mp3` and `public/audio/trailer-en.mp3`, including `public/`. There is no framework asset pipeline. You can provide only one language; the other stays silent. Use MP3, mono, 44.1 or 48 kHz, approximately 96–128 kbps. Leave a short quiet tail through 85 seconds. Avoid clipping; record in a quiet room at a natural speaking pace.

## Recording script and timings

The authoritative script is the `captions` array in [story-data.js](../../story-data.js). Each cue contains absolute `start` / `end` times plus French and English text. This structured format is the subtitle source, equivalent to timed WebVTT cues. The on-page “Read the story” disclosure provides the full text without the player.

| Time | Scene | Direction |
| --- | --- | --- |
| 0–12 s | The question | Thoughtful; leave space between the two questions. |
| 12–28 s | The person | Personal and confident; introduce the schools and availability. |
| 28–47 s | The real world | Clear, concrete; explain the banking work, then the traffic analysis. |
| 47–54 s | ReSlot AI | Describe development and the boundary at final booking writes. |
| 54–61 s | Facial expressions | Explain CNN / FER2013 without adding numerical performance claims. |
| 61–68 s | eGrading | Acknowledge the team project. |
| 68–75 s | Agile Tracker | Separate service domains and databases. |
| 75–85 s | Invitation | Warm closing invitation, not a sales pitch. |

Read each cue in its assigned interval, with silence for any remaining time. If you prefer a different pace, edit scene boundaries, project starts, cue boundaries and `duration` together in the configuration. Controls derive their limits and total-time display from it. Update the test's expected total duration and run the tests afterward. Do not accelerate an unnatural recording merely to fill a slot.

## Playback behavior

- Opening the story always starts muted. “Enable sound” is an explicit opt-in.
- A successful HEAD request and usable duration enable the recording. A missing file, HTML fallback, loading failure, or recording shorter than the timeline falls back to the silent edition.
- While a recording plays, `HTMLAudioElement.currentTime` is the only narrative clock. Pausing, scrubbing and subtitles follow it. Buffering holds the visual timeline; chapters and skip remain available.
- Without audio, a monotonic browser clock supplies the same 85-second timing. Switching language or leaving the tab pauses playback.
- Serve audio with the correct MIME type and HTTP byte-range support for dependable scrubbing. GitHub Pages and typical static hosts support this. A basic local static server may not support byte-range requests.
- No background music is included. Only add original or appropriately licensed audio, and retain its attribution/license.

## Validation

Run `node --test tests/site-check.mjs tests/story-check.mjs`. With the preview server running and Edge installed on Windows, run `node tests/cinema-browser.mjs`. Its synthetic **silent WAV** is intercepted inside the test only; it is not a narration asset and is never written into this folder or shown to visitors.

After adding your recordings, listen to both complete tracks and verify pronunciation, pacing, subtitle alignment, seeking, and pause/resume on your deployment. Automated tests cannot validate your delivery or spoken timing.
