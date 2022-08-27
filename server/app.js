var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    SerialPort = require("serialport").SerialPort

var portName = 'COM3'; //change this to your Arduino port
var serialPort;


// Create global app object
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const logger = (req, res, next)  => {
  console.log('request: ', 'path: ', req.url)
  next();
}

app.use(logger);

app.get('/health', (req, res) => {
  res.status(200).send('Ok');
});

app.post('/emissions', async (req, res) => {
  console.log('/emissions', req.body);
  serialPort.write(req.body);
  res.json({});
})

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
});

// finally, let's start our server...
var server = app.listen(process.env.PORT || 5000, function(){
  console.log('Listening on port ' + server.address().port);
  
  serialPort = new SerialPort({
    baudRate: 9600,
    path: portName,
    // defaults for Arduino serial communication
     dataBits: 8,
     parity: 'none',
     stopBits: 1,
     flowControl: false
  });

  serialPort.on("open", function () {
    console.log('open serial communication '+ portName);
  }); 

  serialPort.on("error", function () {
    console.error('serial port error! ' + portName);
  });

  serialPort.on("close", function () {
    console.error('close serial PORT! ' + portName);
  });
});
