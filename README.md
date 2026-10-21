# The Housing Check

Web tools for **The Housing Check**, a VOS5 interdisciplinary project (economics, mathematics, English and computational thinking) in which havo 4/5 students advise international newcomers on buying a home in Noord-Holland.

## The site

Everything is in **one self-contained file**, `index.html`, with two tabs:

| Tab | For | What it does |
|---|---|---|
| Client Inbox | Students | Students enter their name or group, choose their client from a menu, and e-mail one of eight fictional clients in English. Clients answer questions about their wishes, money, plans and situation, and react positively or negatively when a student proposes a home by its listing number (NH-001 to NH-240). |
| Market day | Teacher | Shows each group's advice side by side and lets the teacher apply an interest-rate shock to see whose advice flips. Open it directly with `#teacher` at the end of the link. |

Use **Download as one file** at the top of the site to save `The_Housing_Check.html`. It works offline: open it by double-clicking. (`marktdag.html` only redirects to the Market day tab.)

## How the Client Inbox works

There is no AI and no server. Replies are built in the browser from fixed rules (`engine.js`) and client data (`data.js`). Nothing a student types leaves their browser; conversations are stored only in that browser's local storage.

The clients' priorities match the answer key in the Teacher Guide. Every client has exactly three homes that fit (see `src/options.json`): option A becomes unaffordable at +0.5% interest, option B at +1%, and option C survives both. When students propose two or three of them, the client compares them and asks which one they advise. For example, the Silva family will tell students that the distance to the station is their least important wish.

Note: the client data is readable in `data.js`. Students who open the source code can see the answers, so tell them the inbox is a tool for practising, not a puzzle.

## Updating

- Client answers and wishes: edit `src/clients_data.py`, then run `cd src && python3 build_data.py` (rewrites `data.js`).
- Matching rules: `engine.js`. Inbox page: `src/inbox.html`. Dashboard page: `src/marktdag.html`.
- After any change, rebuild the single file: `python3 src/build_site.py` (rewrites `index.html`).
- Test questions: `node src/tests/run.js src/tests/questions_students.json`.

All clients, homes and figures are fictional. This is a simplified teaching model and not financial advice.
