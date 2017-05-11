

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var config = require('./config.js');
var _ = require('underscore');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), retrieveCredits);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function retrieveCredits(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: config.spreadsheetId,
    range: config.range,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var films = response.values;
    // Remove the headers from the spreadsheet
    var keys = films[0]
    var films = films.slice(1);
    // Create an array of objects using the headers as keys
    var films = _.map(films, function(film) {
        return _.object(keys,film);
    });
    makeNFOs(films);
  });
}

function makeFiles(filmList) {
    const festivalYear = 2017;
    
    filmList.forEach(function(film) {
        makeNFO(film, festivalYear);
    }, this);
}

function makeNFO(film, festivalYear) {
  let filmString = "";
  filmString += '<movie>\n';
  filmString += `\t<id>${film.id}</id>\n`;
  filmString += `\t<title>${film.title}</title>\n`;
  filmString += `\t<runtime>${film.runtime}</runtime>\n`;
  filmString += `\t<genre>${film.genre_category}</genre>\n`;
  filmString += `\t<year>${festivalYear}</year>\n`;
  filmString += `\t<plot>${film.plot}</plot>\n`;
  filmString += `\t<studio>${film.studio}</studio>\n`;
  filmString += `\t<director>${film.director}</director>\n`;
  if (film.genre_aboriginal !== '') {
      filmString += `\t<tag>${film.genre_aboriginal}</tag>\n`;
  }
  if (film.genre_emerging !== '') {
      filmString += `\t<tag>${film.genre_emerging}</tag>\n`;
  }
  if (film.genre_ruth_shaw !== '') {
      filmString += `\t<tag>${film.genre_ruth_shaw}</tag>\n`;
  }
  if (film.tag_nom !== '') {
      filmString += `\t<tag>${film.tag_nom}</tag>\n`;
  }
  if (film.tag_category_nom !== '') {
      filmString += `\t<tag>${film.tag_category_nom}</tag>\n`;
  }
  if (film.tag_aboriginal_nom !== '') {
      filmString += `\t<tag>${film.tag_aboriginal_nom}</tag>\n`;
  }
  if (film.tag_emerging_nom !== '') {
      filmString += `\t<tag>${film.tag_emerging_nom}</tag>\n`;
  }
  if (film.tag_ruth_shaw_nom !== '') {
      filmString += `\t<tag>${film.tag_ruth_shaw_nom}</tag>\n`;
  }
  if (film.tag_ruth_shaw_nom !== '') {
      filmString += `\t<tag>${film.tag_ruth_shaw_nom}</tag>\n`;
  }
  if (film.tag_dir_nonfiction_nom !== '') {
      filmString += `\t<tag>${film.tag_dir_nonfiction_nom}</tag>\n`;
  }
  if (film.tag_research_nom !== '') {
      filmString += `\t<tag>${film.tag_research_nom}</tag>\n`;
  }
  filmString += '\t<playcount>0</playcount>\n';
  filmString += '</movie>';

  fs.writeFile(('dist/NFOs/' + film.filename + '.nfo'), filmString, 'utf8', (err) => {
      if (err) throw err;
      console.log(`${film.filename}.nfo saved.`);
  });
}