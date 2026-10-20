# The Housing Check

Web tools for **The Housing Check**, a VOS5 interdisciplinary project (economics, mathematics, English and computational thinking) in which havo 4/5 students advise international newcomers on buying a home in Noord-Holland.

## Pages

| Page | For | What it does |
|---|---|---|
| `index.html` | Students | **Client Inbox.** Students e-mail one of eight fictional clients in English and get a reply in character. Clients answer questions about their wishes, money, plans and situation, and react positively or negatively when a student proposes a home by its listing number (NH-001 to NH-240). |
| `marktdag.html` | Teacher | **Market day dashboard.** Shows all clients side by side and lets the teacher apply an interest-rate shock to see whose advice flips. |

## How the Client Inbox works

There is no AI and no server. Replies are built in the browser from fixed rules (`engine.js`) and client data (`data.js`). Nothing a student types leaves their browser; conversations are stored only in that browser's local storage.

The clients' priorities match the answer key in the Teacher Guide. For example, the Silva family will tell students that the distance to the station is their least important wish.

Note: the client data is readable in `data.js`. Students who open the source code can see the answers, so tell them the inbox is a tool for practising, not a puzzle.

## Updating

- Client answers and wishes: edit `src/clients_data.py`, then run `cd src && python3 build_data.py` (this rewrites `data.js`).
- Test questions: `node src/tests/run.js src/tests/questions_students.json`.
- Matching rules: `engine.js`.

All clients, homes and figures are fictional. This is a simplified teaching model and not financial advice.
