/**
 * @file Routes for pages from the root URL. 
 * 
 */
const router = require('express').Router()
const { RenderData } = require('../utils/render-data');

const basepath = '/';

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	const pageData = new RenderData('Home', req.session, res.locals);
	res.render('index', pageData);
});

router.get('/test', (req, res) => {
	const pageData = new RenderData('Test', req.session, res.locals);
	res.render('test', pageData);
});

module.exports = {
	router,
	basepath
};