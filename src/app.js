const http = require('http');
const socketio = require('socket.io');
const xxh = require('xxhashjs');
const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (req, res) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    // if err, throw it for now
    if (err) {
      throw err;
    }
    res.writeHead(200);
    res.end(data);
  });
};

/* // object literal of circles to draw 
const circles = {};
// used for circle movement
let lastTime = 0; */


const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);
// botched circle drawing code
/*
const getRandom = (min, max) => (Math.random() * (max - min)) + min;


// adapted from Boomshine, 330 assignment
const getRandomUnitVector = () => {
  let x = getRandom(-1, 1);
  let y = getRandom(-1, 1);
  let length = Math.sqrt((x * x) + (y * y));
  if (length === 0) { // very unlikely
    x = 1; // point right
    y = 0;
    length = 1;
  } else {
    x /= length;
    y /= length;
  }

  return { x, y };
};

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const calculateDeltaTime = () => {
  let fps;
  const performance = now();
  fps = 1000 / (performance - lastTime);
  fps = clamp(fps, 12, 60);
  lastTime = performance;
  return 1 / fps;
};


// setup circles with starting props 
for (let i = 0; i < 10; ++i) {
  const randVec = getRandomUnitVector();
  circles[i] = {
    x: getRandom(-1, 500),
    y: getRandom(-1, 500),
    radius: 5,
    xSpeed: randVec.x,
    ySpeed: randVec.y,
  };
}


const moveCircles = () => {
  for (let i = 0; i < circles.length; ++i) {
    const c = circles[i];
    const dt = calculateDeltaTime();
    c.x += c.xSpeed * dt;
    if (c.x < c.radius || c.x >= 500 - c.radius) {
      c.xSpeed *= -1;
      c.x += c.xSpeed * dt;
    }

    c.y += c.ySpeed * dt;
    if (c.y < c.radius || c.y >= 500 - c.radius) {
      c.ySpeed *= -1;
      c.y += c.ySpeed * dt;
    }
  }
}; 

*/

io.on('connection', (sock) => {
  const socket = sock;
  socket.join('room1');


  // give socket unique id with date as well, then hex seed
  socket.square = {
    hash: xxh.h32(`${socket.id}${new Date().getTime()}`, 0xFFEE4422).toString(16),
    lastUpdate: new Date().getTime(),
    x: 0,
    y: 0,
    height: 50,
    width: 50,
    prevX: 0,
    prevY: 0,
    destX: 0,
    destY: 0,
    alpha: 0,
  };

  socket.emit('joined', socket.square);
  // io.sockets.in('room1').emit('moveCircles', circles);
  // setInterval(moveCircles, 100);

  socket.on('movementUpdate', (data) => {
    socket.square = data;
    // note: below = server based data(secure), above = client based data (insecure)
    socket.square.lastUpdate = new Date().getTime();

    // io.sockets.in('room1').emit('updatedMovement', socket.square);
    // -> try to draw twice since they get back the info they sent

    // send to everyone in room except this socket
    socket.broadcast.to('room1').emit('updatedMovement', socket.square);
  });

  /*  socket.on('circlesMove', () => {
    
  }); */

  socket.on('disconnect', () => {
    io.sockets.in('room1').emit('left', socket.square.hash);

    socket.leave('room1');
  });
});

console.log(`listening on port ${PORT}`);
