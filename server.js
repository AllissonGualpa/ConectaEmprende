const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist/conecta-emprende/browser')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/conecta-emprende/browser/index.html'));
});

app.listen(process.env.PORT || 4000);