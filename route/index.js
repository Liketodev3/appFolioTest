const Router = require('express').Router;
const router = new Router();

const appFolioController = require('../controllers/appFolioController');

router.get('/test', (...args) => appFolioController.start(...args));
// router.get('/test1', (...args) => appFolioController.test(...args));

// router.get('/test2', linkedinController.test2);
// router.get('/test3', linkedinController.test3);

module.exports = router;