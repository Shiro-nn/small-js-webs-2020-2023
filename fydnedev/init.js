const logger = require('./modules/logger');
const path = require('path');

const fastify = require('fastify')();

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '.public'),
    prefix: '/', // optional: default '/'
});
fastify.register(require('@fastify/view'), {
    engine: {ejs: require('ejs')}
});

fastify.setNotFoundHandler(function (req, reply) {
    reply.view("/.view.ejs", {color: "#d317e4"});
})

fastify.listen({port: 2831, host: 'localhost'}, (err, address) => {
    if (err) throw err;
    logger.log('Сайт запущен на '+address, 'debug');
});