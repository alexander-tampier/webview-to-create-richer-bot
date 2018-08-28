/* ----------  MODULES  ---------- */
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

/* ----------  ROUTES  ---------- */
const index = require('./routes/index');
const options = require('./routes/options');
const optionspostback = require('./routes/optionspostback');
const webhooks = require('./routes/webhooks');

const app = express();

/* =============================================
   =           Basic Configuration             =
   ============================================= */
const { PORT } = process.env;

app.set('port', PORT || 1337);

/* ----------  Static Assets  ---------- */
app.use(express.static('public'));

/* ----------  Parsers  ---------- */
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

/* =============================================
   =                   Routes                  =
   ============================================= */

/* ----------  Primary / Happy Path  ---------- */

app.use('/', index);
app.use('/options', options);
app.use('/optionspostback', optionspostback);
app.use('/webhook', webhooks);

/* =============================================
   =                 Port Setup                =
   ============================================= */

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});


module.exports = app; // eslint-disable-line
