const express = require('express'),
router = express.Router();
const database = require('./mongo');
const config = require('./config');
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', passport.authenticate('discord', {failureRedirect: `${config.protocol}://${config.url}/discord`}), async function(req, res) {
	let userData = await database.findOne({discord: req.user.id});
	if(userData == null || userData == undefined) userData = new database({discord: req.user.id});
	if(req.user.connections.length > 0){
		const _data = req.user.connections.filter(x => x.verified && x.type == 'steam');
		if(_data.length > 0) userData.steam = _data[0].id;
	}
	await userData.save();
	res.redirect(`${config.protocol}://${config.url}/discord/yes`);
});

router.get('/discord/yes', async(req, res) => {
	res.send('<html style="background-color: #0D1117; color:antiquewhite;">' +
	'<h1>Discord привязан</h1>' +
	'</html>')
});

module.exports = router;