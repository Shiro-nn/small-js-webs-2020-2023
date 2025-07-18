const express = require("express"),
router = express.Router();
const vhost = require('vhost');
const accountsData = require("../../base/accounts");
const clansData = require("../../base/clans");
const achievementsData = require("../../base/achievements");
const paymentsData = require("../../base/payments");
const discordsData = require("../../base/discords");
const DonatesData = require("../../base/donate");
const rolesData = require("../../base/roles");
const boostsData = require("../../base/boosts");
const invsData = require("../../base/invites");
const EmojisData = require("../../base/emoji");
const StatsData = require("../../base/stats");
const geoipData = require("../../base/geoip");
const doubtfulsData = require("../../base/doubtful");
const config = require("../../config");
const ipinfo = require("ipinfo");
const axios = require('axios');
const cdn_host_link = config.dashboard.cdn;
const host = config.dashboard.baseURL;
const APIhost = config.dashboard.api;
router.post('/api/user', vhost(host, async(req, res) => {
    let user;
    if(req.query.user == 'this' && req.bs.data.user !== null && req.bs.data.user !== undefined) user = req.bs.data.user.id;
	else user = parseInt(req.query.user);
    if(isNaN(user)) user = undefined;
	let type = req.query.type?.toLowerCase();
    if(type == 'clan'){
        let AllAchievements = await achievementsData.find();
		let userData = await accountsData.findOne({ id: user });
        if(userData == null || userData == undefined) return res.status(404).send('404');
        let achievements = [];
        userData.achievements.forEach(function(achieve) {
            var achievement = AllAchievements.filter(x => x.name == achieve)[0];
            if(achievement != null) achievements.push({img: achievement.img, desc: achievement.desc});
        });
		let access = 0;
		let color = 'red';
		let public = false;
        const clan = await clansData.findOne({ tag: userData.clan });
		const role = await rolesData.findOne({owner:userData.id, id:2, freezed:false})
        if(clan != null && clan != undefined){
            if(clan.users.filter(x => x.user == userData.id).length > 0) access = clan.users.filter(x => x.user == userData.id)[0].access;
            color = clan.color;
			public = clan.public;
		}
        res.status(200).json({
			status: 'ok',
			username: (userData.name == '' ? userData.user : userData.name),
			avatar: userData.avatar,
			banner: userData.banner,
			clan: userData.clan,
			prime: (role != null && role != undefined),
			achievements,
			access, color, public
		})
    }
    else if(type == 'banner'){
		let udata = await accountsData.findOne({ id: user });
        if(udata == null || udata == undefined) return res.status(404).send('404');
		res.status(200).send(udata.banner);
    }
    else if(type == 'main'){
		let userData = await accountsData.findOne({ id: user });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		res.status(200).json({username: (userData.name == '' ? userData.user : userData.name), avatar: userData.avatar, id: userData.id})
    }
    else if(type == 'avatar'){
		let userData = await accountsData.findOne({ id: user });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		res.status(200).send(userData.avatar);
    }
    else if(type == 'username'){
		let userData = await accountsData.findOne({ id: user });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		res.status(200).send(userData.name == '' ? userData.user : userData.name);
    }
    else if(type == 'currency'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.status(401).send('401');
		let userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		let money = 0;
		let statsData = {steam:[], discord:[]};
		if(userData.steam != '') statsData.steam = await StatsData.findOne({ steam: userData.steam });
		if(userData.discord != '') statsData.discord = await StatsData.findOne({ discord: userData.discord });
		if(statsData.steam != undefined && statsData.steam != null &&
			statsData.steam.money != undefined && statsData.steam.money != null) money += statsData.steam.money;
		if(statsData.discord != undefined && statsData.discord != null &&
			statsData.discord.money != undefined && statsData.discord.money != null) money += statsData.discord.money;
		res.status(200).send({balance: userData.balance, money});
    }
    else if(type == 'id'){
		res.json({id:user});
    }
    else res.status(404).send('404');
}));
router.post('/api/clan', vhost(host, async(req, res) => ClanAPI(req, res)));
router.all('/clan', vhost(APIhost, async(req, res) => ClanAPI(req, res)));
async function ClanAPI(req, res) {
	let type = req.query.type?.toLowerCase();
	const ClanTag = req.query.tag?.toUpperCase();
    if(type == 'main'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(clan.users.filter(x => x.user == userData.id).length == 0) return res.sendStatus(401);
		userData.clan = clan.tag;
		await userData.save();
		res.status(200).send('ok');
	}
    else if(type == 'users'){
		const access = parseInt(req.query.access);
		if(isNaN(access)) return res.sendStatus(400);
		if(access > 5 || access < 1) return res.sendStatus(400);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(!clan.public && req.query.token != config.token) return res.sendStatus(401);
		let users = []
		clan.users.filter(x => x.access == access).forEach(user => users.push(user.user));
		res.status(200).json({users});
	}
    else if(type == 'all_users'){
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(!clan.public && req.query.token != config.token) return res.sendStatus(401);
		let lvl1 = [], lvl2 = [], lvl3 = [], lvl4 = [], lvl5 = [];
		clan.users.filter(x => x.access == 1).forEach(user => lvl1.push(user.user));
		clan.users.filter(x => x.access == 2).forEach(user => lvl2.push(user.user));
		clan.users.filter(x => x.access == 3).forEach(user => lvl3.push(user.user));
		clan.users.filter(x => x.access == 4).forEach(user => lvl4.push(user.user));
		clan.users.filter(x => x.access == 5).forEach(user => lvl5.push(user.user));
		res.status(200).json({lvl1, lvl2, lvl3, lvl4, lvl5});
	}
    else if(type == 'notifications'){
		const counts = parseInt(req.query.counts);
		if(isNaN(counts)) return res.sendStatus(400);
		const index = parseInt(req.query.index);
		if(isNaN(index)) return res.sendStatus(400);
		if(counts < 1 || index < 1) return res.sendStatus(400);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(!clan.public){
			if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
			const userData = await accountsData.findOne({ id: req.bs.data.user.id });
			if(userData == null || userData == undefined) return res.sendStatus(404);
			if(clan.users.filter(x => x.user == userData.id).length == 0) return res.sendStatus(401);
		}
		var array = clan.notifications.reverse();
		var new_data = {data:[]};
		for (let i = (counts * index) - counts; i < counts * index; i++){
			if(array[i] != null) new_data.data.push(array[i]);
		}
		res.status(200).json(new_data);
	}
    else if(type == 'replenishment'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(clan.users.filter(x => x.user == userData.id).length == 0) return res.sendStatus(401);
		let balance = req.body.balance;
		let upMoney = req.body.money;
		if(upMoney < 0 || balance < 0) return res.sendStatus(400);
		if(balance > userData.balance) balance = userData.balance;
		let money = 0;
		let statsSteam;
		let statsDiscord;
		if(userData.steam != '') statsSteam = await StatsData.findOne({ steam: userData.steam });
		if(userData.discord != '') statsDiscord = await StatsData.findOne({ discord: userData.discord });
		if(statsSteam != undefined && statsSteam != null && statsSteam.money != undefined && statsSteam.money != null) money += statsSteam.money;
		if(statsDiscord != undefined && statsDiscord != null && statsDiscord.money != undefined && statsDiscord.money != null) money += statsDiscord.money;
		if(upMoney > money) upMoney = money;
		clan.balance += balance;
		userData.balance -= balance;
		clan.money += upMoney;
		const um = upMoney;
		if(statsSteam != undefined && statsSteam != null && statsSteam.money != undefined && statsSteam.money != null) {
			let moneySteam = upMoney;
			if(moneySteam > statsSteam.money) moneySteam = statsSteam.money;
			statsSteam.money -= moneySteam;
			upMoney -= moneySteam;
		}
		if(statsDiscord != undefined && statsDiscord != null && statsDiscord.money != undefined && statsDiscord.money != null){
			let moneyDiscord = upMoney;
			if(moneyDiscord > statsDiscord.money) moneyDiscord = statsDiscord.money;
			statsDiscord.money -= moneyDiscord;
		}
		await clan.save();
		await userData.save();
		if(statsSteam != undefined && statsSteam != null) await statsSteam.save();
		if(statsDiscord != undefined && statsDiscord != null) await statsDiscord.save();
		res.status(200).send('ok');
		let _msg = '';
		let bool_msg = false;
		if(balance > 10){
			_msg += `${balance} рублей`;
			bool_msg = true;
		}
		if(um > 10){
			if(bool_msg) _msg += ' & ';
			_msg += `${um} монет`;
			bool_msg = true;
		}
		if(bool_msg){
			const msg = `<@${userData.id}> положил в клан ${_msg}.`;
			clan.notifications.push({msg, date: Date.now()});
			clan.markModified("notifications");
			await clan.save();
		}
	}
    else if(type == 'money'){
		let clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.status(404).send('404');
		res.status(200).send(clan.money);
	}
    else if(type == 'balance'){
		let clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.status(404).send('404');
		res.status(200).send(clan.balance);
	}
    else if(type == 'currency'){
		let clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.status(404).send('404');
		res.status(200).json({balance: clan.balance, money: clan.money});
	}
    else if(type == 'invite'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.status(401).send('401');
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.status(404).send('404');
		if(clan.users.filter(x => x.user == userData.id && x.access >= 2).length > 0){
			async function CreateInv() {
				let _code = 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
				let __ = await invsData.findOne({ code: _code });
				if(__ == null || __ == undefined){
					let invData = new invsData({code:_code, clan:clan.tag, expires:GetDate(new Date(),{days:1,months:0,years:0,hours:0,minutes:0}), by:userData.id});
					await invData.save();
					res.status(200).json({status: 'ok', link: `https://${config.dashboard.baseURL}/inv/${_code}`});
				}else{CreateInv();}
			}
			CreateInv();
		}
		else res.status(403).send('403');
	}
    else if(type == 'access'){
		let user;
		if(req.query.user == 'this' && req.bs.data.user !== null && req.bs.data.user !== undefined) user = req.bs.data.user.id;
		else user = parseInt(req.query.user);
		if(isNaN(user)) user = undefined;
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		const userData = await accountsData.findOne({ id: user });
        if(userData == null || userData == undefined) return res.sendStatus(404);
		let access = 0;
		if(clan.users.filter(x => x.user == userData.id).length > 0) access = clan.users.filter(x => x.user == userData.id)[0].access;
		res.status(200).json({access});
	}
    else if(type == 'roles'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(clan.users.filter(x => x.user == userData.id).length < 1) return res.sendStatus(403);
		const clan_user = clan.users.filter(x => x.user == userData.id)[0];
		if(clan_user.access < 3) return res.status(403).send('403');
		if(clan.users.filter(x => x.user == req.body.target).length < 1) return res.sendStatus(403);
		const clan_target = clan.users.filter(x => x.user == req.body.target)[0];
		const new_access = req.body.access;
		if(clan_user.access == 3 && clan_target.access < new_access) return res.sendStatus(403);
		if(new_access >= clan_user.access) return res.sendStatus(403);
		if(new_access < 1 || new_access > 4) return res.sendStatus(403);
		clan_target.access = new_access;
		clan.users.filter(x => x.user == req.body.target)[0] = clan_target;
		clan.markModified("users");
		await clan.save();
		res.status(200).send('ok');
	}
    else if(type == 'visible'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(clan.users.filter(x => x.user == userData.id && x.access >= 4).length < 1) return res.sendStatus(403);
		clan.public = !clan.public;
		await clan.save();
		let msg = 'Сделать публичным кланом';
		if(clan.public) msg = 'Сделать приватным кланом';
		res.status(200).json({status:'ok', text:msg});
	}
    else if(type == 'boosts'){
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(!clan.public && req.query.token != config.token) return res.sendStatus(401);
		const boosts = await boostsData.find();
		let available = [];
		let boostsJson = [];
		for (let i = 0; i < boosts.length; i++) if(clan.boosts.filter(x => x.id == boosts[i].id).length == 0) available.push(boosts[i].id);
		for (let i = 0; i < clan.boosts.length; i++) boostsJson.push(clan.boosts[i].id);
		res.json({boosts: boostsJson, available});
	}
    else if(type == 'buy_boost'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		const userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		const clan = await clansData.findOne({ tag: ClanTag });
		if(clan === null || clan === undefined) return res.sendStatus(404);
		if(clan.users.filter(x => x.user == userData.id).length < 1) return res.sendStatus(403);
		const clan_user = clan.users.filter(x => x.user == userData.id)[0];
		if(clan_user.access < 4) return res.sendStatus(403);
		const BoostId = parseInt(req.query.boost);
		if(isNaN(BoostId)) return res.sendStatus(400);
		const boost = await boostsData.findOne({id: BoostId});
		if(clan.boosts.filter(x => x.id == boost.id).length != 0) return res.sendStatus(400);
		if(clan.balance < boost.sum) return res.sendStatus(400);
		clan.balance -= boost.sum;
		clan.boosts.push({id:boost.id, to: Date.now() + (1000 * 60 * 60 * 24 * 30)});
		clan.markModified('boosts');
		const msg = `<@${userData.id}> купил буст '${boost.name}' за ${boost.sum}₽.`;
		clan.notifications.push({msg, date: Date.now()});
		clan.markModified("notifications");
		await clan.save();
		res.send('ok');
	}
    else res.sendStatus(404);
};
router.post('/api/boosts', vhost(host, async(req, res) => {
	const BoostId = parseInt(req.query.id);
    if(isNaN(BoostId)) return res.sendStatus(400);
	const boost = await boostsData.findOne({id: BoostId});
	if(boost === null || boost === undefined) return res.sendStatus(404);
	res.json({id: boost.id, name: boost.name, img: boost.img, sum: boost.sum});
}));
router.post('/api/discord', vhost(host, async(req, res) => {
    let id;
    if(req.query.id == 'this' && req.bs.data.user !== null && req.bs.data.user !== undefined) id = req.bs.data.user.discord;
	else id = req.query.id;
	let type = req.query.type?.toLowerCase();
	if(type == 'username'){
		let discordData = await discordsData.findOne({id});
		if(discordData == null || discordData == undefined) return res.sendStatus(404);
		res.status(200).send(discordData.user);
    }
	else if(type == 'main'){
		let discordData = await discordsData.findOne({id});
		if(discordData == null || discordData == undefined) return res.sendStatus(404);
		res.status(200).json({id: discordData.id, user: discordData.user, discriminator: discordData.discriminator, avatar: discordData.avatar});
    }
    else res.sendStatus(404);
}));
router.post('/api/emoji', vhost(host, async(req, res) => {
	let type = req.query.type?.toLowerCase();
    let emj = parseInt(req.query.id);
    if(isNaN(emj)) emj = undefined;
	if(type == 'url'){
		let emoji = await EmojisData.findOne({ id: emj });
        if(emoji == null || emoji == undefined) return res.sendStatus(404);
		return res.send(emoji.url);
	}
	else if(type == 'name'){
		let emoji = await EmojisData.findOne({ id: emj });
        if(emoji == null || emoji == undefined) return res.sendStatus(404);
		return res.send(emoji.name);
	}
	else if(type == 'data'){
		let emoji = await EmojisData.findOne({ id: emj });
        if(emoji == null || emoji == undefined) return res.sendStatus(404);
		return res.json({name:emoji.name,url:emoji.url,id:emoji.id});
	}
	else if(type == 'all'){
		const emojis = await EmojisData.find();
		return res.json(emojis);
	}
    else res.sendStatus(404);
}));
router.post('/api/donate', vhost(host, async(req, res) => {
	let type = req.query.type?.toLowerCase();
	if(type == 'info'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		let userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.status(404).send('404');
		let DonateData = null;try{DonateData = await DonatesData.findOne({_id:req.query.donate});}catch{return res.sendStatus(401);}
		if(DonateData == null || DonateData == undefined) return res.status(404).send('404');
		if(userData.id != 1 && userData.user != DonateData.owner) return res.sendStatus(401);
		res.status(200).json({
			owner: DonateData.owner,
			sum: DonateData.sum,
			promo: DonateData.promo,
			to: DonateData.to,
			force: DonateData.force,
			give: DonateData.give,
			effects: DonateData.effects,
			players_roles: DonateData.players_roles,
			prefix: DonateData.prefix,
			color: DonateData.color,
			server: DonateData.server,
		});
    }
	else if(type == 'moneyback'){
		if(req.bs.data.user == null || req.bs.data.user == undefined) return res.sendStatus(401);
		let userData = await accountsData.findOne({ id: req.bs.data.user.id });
		if(userData == null || userData == undefined) return res.sendStatus(404);
		let DonateData = null;
		try{DonateData = await DonatesData.findOne({_id:req.query.donate});}catch{return res.sendStatus(401);}
		if(DonateData == null || DonateData == undefined) return res.sendStatus(404);
		if(userData.id != 1 && userData.user != DonateData.owner) return res.sendStatus(401);
		let ownerData = await accountsData.findOne({ user: DonateData.owner });
		ownerData.balance += GetMoney(DonateData.sum, DonateData.promo, DonateData.to);
		await ownerData.save();
		await DonateData.remove();
		res.status(200).send('ok');
		function GetMoney(sum, promo, date) {
			let allow_back = sum-promo;
			if(0 >= allow_back) return 0;
			var datetime_regex = /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/;
			var date_arr = datetime_regex.exec(date);
			let days = 30;
			if(date_arr[2] == 2 || date_arr[2] == 4 || date_arr[2] == 6 || date_arr[2] == 8 || date_arr[2] == 9 || date_arr[2] == 11 || date_arr[2] == 1) days = 31;
			var to = new Date(date_arr[3], date_arr[2]-=1, date_arr[1]-=1, date_arr[4], date_arr[5]);
			let tt = getDaysBetweenDates(Date.now(),to);
			if(tt > 30) tt = 0;
			return Math.round((sum/days)*tt);
			function getDaysBetweenDates(d0, d1) {
				var msPerDay = 8.64e7;
				var x0 = new Date(d0);
				var x1 = new Date(d1);
				x0.setHours(12,0,0);
				x1.setHours(12,0,0);
				return Math.round( (x1 - x0) / msPerDay );
			}
		}
    }
    else res.status(404).send('404');
}));
router.post('/api/geoip', vhost(host, async(req, res) => GeoIPAPI(req, res)));
router.all('/geoip', vhost(APIhost, async(req, res) => GeoIPAPI(req, res)));
router.post('/api/doubtful', vhost(host, async(req, res) => DoubtfulAPI(req, res)));
router.all('/doubtful', vhost(APIhost, async(req, res) => DoubtfulAPI(req, res)));
router.post('/api/userips', vhost(host, async(req, res) => UserIPSAPI(req, res)));
router.all('/userips', vhost(APIhost, async(req, res) => UserIPSAPI(req, res)));
async function GeoIPAPI(req, res) {
	const ip = req.query.ip;
	if(ip == null || ip == undefined) return res.sendStatus(401);
    let geoip = await geoipData.findOne({ip});
	if(geoip == null){
		ipinfo(ip, '').then(async data => {
			geoip = new geoipData({
				ip:data.ip,
				city:data.city,
				region:data.region,
				country:data.country,
				loc:data.loc,
				org:data.org,
				postal:data.postal,
				timezone:data.timezone
			});
			await geoip.save();
			res.status(200).json({
				ip:geoip.ip,
				city:geoip.city,
				region:geoip.region,
				country:geoip.country,
				loc:geoip.loc,
				org:geoip.org,
				postal:geoip.postal,
				timezone:geoip.timezone
			});
		}).catch(() => res.status(200).json({ip, city:undefined,region:undefined,country:undefined,loc:undefined,org:undefined,postal:undefined,timezone:undefined}));
	}else{
		res.status(200).json({
			ip:geoip.ip,
			city:geoip.city,
			region:geoip.region,
			country:geoip.country,
			loc:geoip.loc,
			org:geoip.org,
			postal:geoip.postal,
			timezone:geoip.timezone
		});
	}
}
let doubtfulsArray = [];
async function DoubtfulAPI(req, res) {
	const SteamID64 = req.query.steam;
	if(SteamID64 == null || SteamID64 == undefined) return res.sendStatus(400);
    let doubtful = await doubtfulsData.findOne({id:SteamID64});
	if(doubtful == null){
		const uid = guid();
		if(doubtfulsArray.filter(x => x.steam == SteamID64).length > 0) return doubtfulsArray.push({steam:SteamID64, uid, res});
		doubtfulsArray.push({steam:SteamID64, uid, res:null});
		axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1?key=${config.SteamAPI}&steamids=${SteamID64}&format=json`).then(async resp => {
			const _pl = resp.data.players.find(x => x.SteamId == SteamID64);
			axios.get(`https://steamid.xyz/${SteamID64}`).then(async resp2 => {
				const _date = resp2.data.split('<i>Account Created:</i>')[1].split('<br>')[0].trim();
				const _vis = resp2.data.split('<i>Visibility:</i>')[1].split('<br>')[0].trim();
				const dateArray = _date.split(' ');
				let date = 0;
				if(_vis == 'Public' && 3 >= dateArray.length && dateArray[2] != '1970'){
					let month = 0;
					const _domnth = dateArray[1];
					if(_domnth == 'Feb') month = 1;
					else if(_domnth == 'Mar') month = 2;
					else if(_domnth == 'Apr') month = 3;
					else if(_domnth == 'May') month = 4;
					else if(_domnth == 'Jun') month = 5;
					else if(_domnth == 'Jul') month = 6;
					else if(_domnth == 'Aug') month = 7;
					else if(_domnth == 'Sep') month = 8;
					else if(_domnth == 'Oct') month = 9;
					else if(_domnth == 'Nov') month = 10;
					else if(_domnth == 'Dec') month = 11;
					const _dt = new Date(dateArray[2], month, dateArray[0]);
					date = _dt.getTime();
				}
				doubtful = new doubtfulsData({
					id:SteamID64,
					banned:_pl.DaysSinceLastBan > 0 || _pl.NumberOfGameBans > 0 || _pl.NumberOfVACBans > 0,
					created:date,
				});
				await doubtful.save();
				const _json = {
					id:doubtful.id,
					banned:doubtful.banned,
					created:doubtful.created,
					created_formatted: GetDate(new Date(doubtful.created)).split(' ')[0]
				};
				res.status(200).json(_json);
				let arr2 = doubtfulsArray.filter(x => x.steam == SteamID64 && x.res != null && x.uid != uid);
				for (let i = 0; i < arr2.length; i++) {
					try{arr2[i].res.status(200).json(_json);}catch{}
				}
				arr2 = [];
				doubtfulsArray = doubtfulsArray.filter(x => x.steam != SteamID64);
			});
		});
	}else{
		res.status(200).json({
			id:doubtful.id,
			banned:doubtful.banned,
			created:doubtful.created,
			created_formatted: GetDate(new Date(doubtful.created)).split(' ')[0]
		});
	}
};
async function UserIPSAPI(req, res) {
	const SteamID64 = req.query.steam;
	if(SteamID64 == null || SteamID64 == undefined) return res.sendStatus(400);
	if(req.query.token != config.token) return res.sendStatus(403);
    const stats = await StatsData.findOne({steam:SteamID64});
	if(stats == null) return res.sendStatus(400);
	let geoips = [];
	let ips = [];
	for (let i = 0; i < stats.ips.length; i++) {
		const _ip = stats.ips[i];
		if(geoips.filter(x => x.ip == _ip).length > 0) continue;
		let geoip = await geoipData.findOne({ip:_ip});
		if(geoip == null){
			const _d = await GetIpData(_ip, geoip);
			geoips.push(_d);
		}else{
			geoips.push({
				ip:geoip.ip,
				city:geoip.city,
				region:geoip.region,
				country:geoip.country,
				loc:geoip.loc,
				org:geoip.org,
				postal:geoip.postal,
				timezone:geoip.timezone
			});
		}
		ips.push(_ip);
	}
	res.status(200).json({
		steam:stats.steam, ips, geoips
	});
};
async function GetIpData(ip, geoip) {
	return new Promise(resolve => {
		ipinfo(ip, '').then(async data => {
			geoip = new geoipData({
				ip:data.ip,
				city:data.city,
				region:data.region,
				country:data.country,
				loc:data.loc,
				org:data.org,
				postal:data.postal,
				timezone:data.timezone
			});
			await geoip.save();
			resolve({
				ip:geoip.ip,
				city:geoip.city,
				region:geoip.region,
				country:geoip.country,
				loc:geoip.loc,
				org:geoip.org,
				postal:geoip.postal,
				timezone:geoip.timezone
			});
		}).catch(() => resolve({ip, city:undefined,region:undefined,country:undefined,loc:undefined,org:undefined,postal:undefined,timezone:undefined}));
	});
}
router.post('/api/avatar', vhost(host, async(req, res) => {
	if(req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		let data = req.body;
		let userData = await accountsData.findOne({ user: req.bs.data.user.user });
		userData.avatar = `${cdn_host_link}/scpsl.store/users/avatars/${userData.id}/${data.hash}.${data.format}`;
		await userData.save();
		res.status(200).send('ok');
    }
}));
router.post('/api/banner', vhost(host, async(req, res) => {
	if(req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		let data = req.body;
		let userData = await accountsData.findOne({ user: req.bs.data.user.user });
		userData.banner = `${cdn_host_link}/scpsl.store/users/banner/${userData.id}/${data.hash}.${data.format}`;
		await userData.save();
		res.status(200).send('ok');
    }
}));
router.post('/api/banner/delete', vhost(host, async(req, res) => {
	if(req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		let userData = await accountsData.findOne({ user: req.bs.data.user.user });
		userData.banner = '';
		await userData.save();
		res.status(200).send('ok');
    }
}));
router.post('/api/prefix', vhost(host, async(req, res) => {
	if (req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		if(req.body.prefix.length > 20) return res.status(400).send('many_length');
		let userData = await accountsData.findOne({ user: req.bs.data.user.user });
		if(req.body.prefix !== null && req.body.prefix !== undefined) userData.prefix = req.body.prefix;
		await userData.save();
		try{res.redirect("/profile");}catch{}
	};
}));
router.post('/api/name', vhost(host, async(req, res) => {
	if (req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		if(req.body.name.length > 25) return res.status(400).send('many_length');
		let userData = await accountsData.findOne({ user: req.bs.data.user.user });
		if(req.body.name !== null && req.body.name !== undefined) userData.name = req.body.name;
		await userData.save();
		try{res.redirect("/profile");}catch{}
	};
}));
const QurreAPI = require('qurre-pay');
const Qurre = new QurreAPI(config.payments.secret, config.payments.public);
router.post('/api/balance', vhost(host, async(req, res) => {
	if (req.bs.data.user == null){
        res.redirect(`/authorization?redirect=profile`);
    }else{
		let payData = await paymentsData.findOne();
		if(payData === null || payData === undefined) {
			payData = new paymentsData();
		}
		const Payment = await Qurre.CreatePayment(req.body.sum, `Пополнение баланса №${payData.paymentid}`);
		payData.payments.push({
			id: Payment.payment,
			user: req.bs.data.user.user
		});
        payData.paymentid++;
		await payData.save();
		res.status(200).send(Payment.link);
	};
}));
module.exports = router;
function GetDate(date, add = {
	days: 0,
	months: 0,
	years: 0,
	hours: 0,
	minutes: 0
}) {
	let day = date.getDate() + add.days;
	let month = date.getMonth() + 1 + add.months;
	let year = date.getFullYear() + add.years;
	let hour = date.getHours() + add.hours;
	let minute = date.getMinutes() + add.minutes;
	if (parseInt(month) == 2 && parseInt(day) > 28) {
		day = "1";
		month = '3';
	}
	if ((parseInt(month) == 4 || parseInt(month) == 6 || parseInt(month) == 9 || parseInt(month) == 11) && parseInt(day) > 30) {
		day = "1";
		const mnth = parseInt(month) += 1;
		month = mnth;
	}
	if(parseInt(day) > 31){
		day = "1";
		const mnth = parseInt(month) += 1;
		month = mnth;
	}
	if (parseInt(day) < 10) {
		var t = "0";
		t += day;
		day = t;
	}
	if (parseInt(hour) < 10) {
		var t = "0";
		t += hour;
		hour = t;
	}
	if (parseInt(minute) < 10) {
		var t = "0";
		t += minute;
		minute = t;
	}
	if (parseInt(month) == 13) {
		month = "01";
		year = date.getFullYear() + 1;
	}
	if (parseInt(month) < 10) {
		var t = "0";
		t += month;
		month = t;
	}
	var time = day + "." + month + "." + year + " " + hour + ':' + minute;
	return time;
}
const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}