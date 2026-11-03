/**
 * Red Planet Resorts – registration + NASA ID validation Web App.
 *
 * Sheets (created automatically if missing):
 *   "Registrations" – one row per user (updated if the same email registers again)
 *   "NASA_IDs"      – column A: valid NASA IDs (header in row 1)
 *
 * Deploy: Extensions → Apps Script → paste this file → Deploy → New deployment →
 *   type "Web app", Execute as "Me", Who has access "Anyone".
 * Put the resulting ".../exec" URL in EXPO_PUBLIC_GOOGLE_SCRIPT_URL.
 *
 * GET  ?action=validateNasaId&nasaId=XXX  → { success, valid }
 * POST { action: "register", fullName, email, address, nasaId, platform } → { success, message }
 */

var REGISTRATIONS_SHEET = 'Registrations';
var NASA_IDS_SHEET = 'NASA_IDs';
var HEADERS = ['Timestamp', 'Full Name', 'Email', 'Address', 'NASA ID', 'NASA ID Verified', 'Platform'];
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doGet(e) {
  var params = (e && e.parameter) || {};
  if (params.action === 'validateNasaId') {
    var id = normalizeId(params.nasaId);
    if (!id) return json({ success: false, message: 'NASA ID is required.' });
    return json({ success: true, valid: isValidNasaId(id) });
  }
  return json({ success: false, message: 'Unknown action.' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ success: false, message: 'Invalid request body.' });
  }

  if (body.action !== 'register') {
    return json({ success: false, message: 'Unknown action.' });
  }

  var fullName = String(body.fullName || '').trim();
  var email = String(body.email || '').trim().toLowerCase();
  var address = String(body.address || '').trim();
  var nasaId = normalizeId(body.nasaId);
  var platform = String(body.platform || '').trim();

  if (fullName.length < 2 || address.length < 5) {
    return json({ success: false, message: 'Please fill in all required fields.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return json({ success: false, message: 'Please enter a valid email address.' });
  }

  var nasaVerified = nasaId ? isValidNasaId(nasaId) : false;
  if (nasaId && !nasaVerified) {
    return json({ success: false, message: 'NASA ID was not found in our records.' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet(REGISTRATIONS_SHEET, HEADERS);
    var row = [new Date(), fullName, email, address, nasaId, nasaVerified ? 'Yes' : 'No', platform];

    var existingRow = findRowByEmail(sheet, email);
    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
      return json({ success: true, message: 'Registration updated.' });
    }

    sheet.appendRow(row);
    return json({ success: true, message: 'Registration saved.' });
  } finally {
    lock.releaseLock();
  }
}

function isValidNasaId(id) {
  var sheet = getSheet(NASA_IDS_SHEET, ['NASA ID']);
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (normalizeId(values[i][0]) === id) return true;
  }
  return false;
}

function findRowByEmail(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === email) return i + 2;
  }
  return 0;
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function normalizeId(value) {
  return String(value || '').trim().toUpperCase();
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
