# Lead → Google Sheet setup (~5 minutes)

The chat writes every captured lead as a row in a Google Sheet via a Google Apps Script
web app — no OAuth, no service-account keys. The endpoint is protected by a shared secret
token so that only our server can append rows.

## 1. Create the sheet

Create a new Google Sheet (e.g. "OlanAI Leads"). **Leave it blank** — the script writes the
header row automatically on the first lead.

## 2. Add the Apps Script

In the sheet: **Extensions → Apps Script**, delete any boilerplate, paste this, and **Save**.

Then set `SHEET_TOKEN` to a long random secret (the **same** value you'll put in `.env.local`
as `SHEET_WEBHOOK_TOKEN`).

```javascript
// Must match SHEET_WEBHOOK_TOKEN in the server's .env.local
var SHEET_TOKEN = 'PASTE_THE_SAME_SECRET_HERE';

var HEADERS = [
  'capturedAt', 'name', 'email', 'companyName', 'serviceCategory', 'projectSummary',
  'budget', 'timeline', 'priority', 'fitScore', 'fitReason', 'additionalNotes', 'leadId'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Reject anything without the correct shared secret.
    if (!data.token || data.token !== SHEET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow(HEADERS.map(function (key) { return data[key] || ''; }));

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Deploy as a web app

1. **Deploy → New deployment** → gear icon → **Web app**.
2. **Execute as:** Me. **Who has access:** **Anyone**.
   (The endpoint only *appends* rows and requires the secret; it never reads or returns data.)
3. **Deploy**, authorize when prompted, and copy the **Web app URL**
   (`https://script.google.com/macros/s/AKfy.../exec`).

> Whenever you change `SHEET_TOKEN` or the script, you must **redeploy** (Deploy → Manage
> deployments → edit → New version) for the change to take effect at the same URL.

## 4. Wire it up

In `.env.local`, set both values (the token must match the script exactly):

```
SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
SHEET_WEBHOOK_TOKEN=<the same secret as SHEET_TOKEN>
```

Restart the dev stack (`npm run dev`) so the server picks up the env vars. Captured leads now
append to the sheet. Leaving `SHEET_WEBHOOK_URL` empty skips sheet writes (leads still log to
the console).

## How it's verified

The server (`appendLeadToSheet` in `server/index.ts`) POSTs each lead — including `token` —
to `SHEET_WEBHOOK_URL`. A correct token appends a row; a wrong/missing token is rejected with
`{ok:false,error:'unauthorized'}` and no row is written.
