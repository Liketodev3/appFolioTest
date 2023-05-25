require('dotenv').config();
const router = require('./route/index');
const ejs_locals_engine = require('ejs-locals');
const path = require('path');

(async () => {
   const express = require('express');
   const app = express();

   app.engine('ejs', ejs_locals_engine);

   app.set("views", path.join(__dirname, "views"));
   app.set('view engine', 'ejs');

   app.use(express.json());
   app.use('/', router);

   await app.listen(7755, () => console.log('server in ' + 5000));
})();
