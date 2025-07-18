const path = require('path');
const fastify = require('fastify')();

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '.public'),
    prefix: '/', // optional: default '/'
});

fastify.listen({port: 4252}, (err, address) => {
    if (err) throw err;
    console.log('Раздатчик контента запущен на '+address);
});