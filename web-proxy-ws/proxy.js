const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'http://localhost:2600',
    changeOrigin: false,
    ws: true,
    router: {
        'bot.fydne.xyz': 'http://mirror.scpsl.store',
        'socket.scpsl.store/socket.io': 'http://mirror.scpsl.store',
        'socket-clans.scpsl.store/socket.io': 'http://mirror.scpsl.store',
        
        'scpsl.store': 'http://mirror.scpsl.store',
        'api.scpsl.store': 'http://mirror.scpsl.store',
        'connect.scpsl.store': 'http://mirror.scpsl.store',
        'beta.scpsl.store': 'http://mirror.scpsl.store',

        'cdn.scpsl.store': 'http://mirror.scpsl.store',
        'reserve.fydne.xyz': 'http://mirror.scpsl.store',
        
        'fydne.xyz': 'http://mirror.scpsl.store',
        'mods.fydne.xyz': 'http://mirror.scpsl.store',
    },
    onError: (err, req, res) => {try{
        res.writeHead(500, {
            'Content-Type': 'text/plain',
        });
        res.end('Proxy error (#1)');
    }catch{}},
};
const webProxy = createProxyMiddleware(options);
const app = express();
app.disable("x-powered-by");
app.use(webProxy);
{
    const server = app.listen(80);
    server.on('upgrade', webProxy.upgrade);
}
{
    const crt = require('./crt')
    const server = require('https').createServer({
        key: crt.key,
        cert: crt.crt
    }, app);
    server.listen(443);
    server.on('upgrade', webProxy.upgrade);
}