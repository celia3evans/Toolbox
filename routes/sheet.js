const { google } = require('googleapis');

const SHEET_ID  = '1JP2IrAkzJOzFxxzveLTRM5QsMX1337XMWWp56h5l8uk';

// Sheet schema (columns A–I):
// A: id | B: title-en | C: titre-fr | D: link-en | E: lien-fr
// F: description-en | G: description-fr | H: categories | I: free (boolean)
const SHEET_TAB = 'LinksNResources';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

/** Fetch all rows and map them to named objects. */
async function fetchResources() {
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1:I1000`,
  });

  const [, ...rows] = result.data.values;

  return rows.map(row => ({
    id:               row[0] ? Number(row[0]) : null,
    'title-en':       row[1] || '',
    'titre-fr':       row[2] || '',
    'link-en':        row[3] || '',
    'lien-fr':        row[4] || '',
    'description-en': row[5] || '',
    'description-fr': row[6] || '',
    categories:       row[7] || '',
    free:             row[8]?.toString().toUpperCase() === 'TRUE',
  }));
}

/** Send a JSON response. */
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Sheet route handler.
 * Handles all requests starting with /api/sheet.
 * Returns true if the request was handled.
 */
async function sheetHandler(req, res) {
  // GET /api/sheet — list resources with optional filters
  // Query params (combinable):
  //   ?id=1               — exact match on id
  //   ?category=internal  — rows whose categories field contains this value
  //   ?free=true|false    — filter by the free column
  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url, 'http://localhost');
      const filterId       = searchParams.get('id');
      const filterCategory = searchParams.get('category');
      const filterFree     = searchParams.get('free');

      let resources = await fetchResources();

      if (filterId !== null) {
        resources = resources.filter(r => r.id === Number(filterId));
      }
      if (filterCategory !== null) {
        const cat = filterCategory.toLowerCase();
        resources = resources.filter(r =>
          r.categories.toLowerCase().split(',').map(c => c.trim()).includes(cat)
        );
      }
      if (filterFree !== null) {
        const wantFree = filterFree.toLowerCase() === 'true';
        resources = resources.filter(r => r.free === wantFree);
      }

      json(res, 200, resources);
      return true;
    } catch (err) {
      json(res, 500, { error: err.message });
      return true;
    }
  }

  // POST /api/sheet — append a new row
  // Body: { "values": [["id", "title-en", "titre-fr", "link-en", "lien-fr", "desc-en", "desc-fr", "categories", "free"]] }
  if (req.method === 'POST') {
    return new Promise(resolve => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { values } = JSON.parse(body);
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_TAB}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
          });
          json(res, 200, { ok: true });
        } catch (err) {
          json(res, 500, { error: err.message });
        }
        resolve(true);
      });
    });
  }

  return false;
}

module.exports = sheetHandler;
