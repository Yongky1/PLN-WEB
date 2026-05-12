const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const os = require('os');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const adminRouter = require('./routes/admin');
const pagesRouter = require('./routes/pages');
const proxyRouter = require('./routes/proxy');
const sessionRouter = require('./routes/session');
const { authGuard } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const helmetOptions = require('./config/helmetOptions');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(helmet(helmetOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/scripts/three/jsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.use('/', pagesRouter);
app.use('/', proxyRouter);
app.use('/', sessionRouter);
app.use('/admin', authGuard, adminRouter);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  console.log(`===============================================`);
  console.log(`🚀 PLN Pusdiklat Concept running on http://localhost:${PORT}`);
  console.log(`🌍 Untuk akses dari device lain : http://${localIP}:${PORT}`);
  console.log(`📡 Backend API : ${process.env.BACKEND_URL || 'http://localhost:4000'}`);
  console.log(`===============================================`);
});
