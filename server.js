const http = require('http');
const path = require('path');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const tipi = {
    '.html': { type: 'text/html', folder: 'html' },
    '.css': { type: 'text/css', folder: 'css' },
    '.js': { type: 'application/javascript', folder: 'js' },
    '.jpg': { type: 'image/jpeg', folder: 'img' },
    '.mp4': { type: 'video/mp4', folder: 'video' },
    '.png': { type: 'image/png', folder: 'img' }
};
async function requestHandler(req, res) {
    const urlDecoded = decodeURIComponent(req.url);
    let estensione = path.extname(urlDecoded) || '.html';
    let nome = path.basename(urlDecoded, estensione) || 'home';
    let tipo = tipi[estensione.toLowerCase()];
    if (tipo) {
        let percorso = path.join(__dirname, tipo.folder, nome + estensione);
        fs.stat(percorso, (err, stats) => {
            if (err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                const per = path.join(__dirname, 'html', '404.html');
                const errorStream = fs.createReadStream(per);
                errorStream.pipe(res);
                errorStream.on('error', (streamErr) => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Errore interno del server.');
                });
                return;
            }
            const grfile = stats.size;
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : grfile - 1;
                if (start >= grfile || end >= grfile) {
                    res.writeHead(416, {
                        'Content-Range': `bytes */${grfile}`
                    });
                    return res.end();
                }
                const headers = {
                    'Content-Range': `bytes ${start}-${end}/${grfile}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': (end - start) + 1,
                    'Content-Type': tipo.type
                };
                res.writeHead(206, headers);
                const videoStream = fs.createReadStream(percorso, { start, end });
                videoStream.pipe(res);
                videoStream.on('error', (streamErr) => {
                    console.error("Errore durante lo streaming del file:", streamErr);
                    res.end();
                });

            }
            else {
                res.writeHead(200, {
                    'Content-Type': tipo.type,
                    'Content-Length': stats.size
                });
                const fileStream = fs.createReadStream(percorso);
                fileStream.pipe(res);
                fileStream.on('error', (streamErr) => {
                    console.error("Errore durante lo streaming del file:", streamErr);
                    res.end();
                });
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        const per = path.join(__dirname, 'html', '404.html');
        const errorStream = fs.createReadStream(per);
        errorStream.pipe(res);
        errorStream.on('error', (streamErr) => {
            console.error("Errore nel servire 404.html:", streamErr);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Errore interno del server.');
        });
    }

}
var server = http.createServer(requestHandler);
server.listen(port, hostname, function () {

    console.log(`Server running at http://${hostname}:${port}/`);

});