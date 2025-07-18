const express = require("express");
const http = require("http");
const app = express();
app
.use(function(req, res, next){
    return res.send(`<!DOCTYPE html>
<html lang="ru" translate="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="fydne - Перенаправление">
<meta name="author" content="fydne">
<title>fydne</title>
<script type="module" src="https://cdn.scpsl.store/another/5029b2a3477f/script.js"></script>
<meta property="og:title" content="fydne" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://fydne.xyz" />
<meta property="og:image" content="https://cdn.scpsl.store/another/991d1ceed4a7/fydne.png" />
<meta property="og:description" content="fydne - Перенаправление" />
<meta name="theme-color" content="#ff0000">
<link rel="icon" type="image/ico" href="https://cdn.scpsl.store/another/991d1ceed4a7/fydne.png" />
<link rel="stylesheet" href="https://cdn.scpsl.store/another/ec11171fb275/redirect.css">
</head>
<body>
<div class="q1">
<div class="q2" onclick="document.location = 'https://scpsl.store'">
<img class="q3" src="https://cdn.scpsl.store/scpsl.store/img/etc/scpsl.png">
<hr class="q4">
<p class="q5">SCP:sl</p>
</div>
<div class="q2" onclick="document.location = 'https://bot.fydne.xyz'">
<img class="q3" src="https://bot.fydne.xyz/img/qurre.png">
<hr class="q4">
<p class="q5">Qurre Bot</p>
</div>
<div class="q2" onclick="document.location = 'https://scpsl.store/status'">
<img class="q3" src="https://cdn.scpsl.store/favicon.ico">
<hr class="q4">
<p class="q5">Status</p>
</div>
</div>
</body>
</html>`);
})
http.createServer(app).listen(2831, 'localhost');