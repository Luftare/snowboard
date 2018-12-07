var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var DTMS = 16;
var DT = DTMS / 1000;
var TIME_RATE = 0.9;
var SHADOW_COLOR = '#777';
var PARTICLE_COLOR = '#FFF';
var GRAVITY = 250;
var FRICTION = 0.0008;
var CURVING_POWER = 2;
var JUMP_POWER = 50;
var CAMERA_Z = 0.5;
var HILL_ANGLE = Math.PI * (20 / 180);
var shakeCounter = 0;
var currentSlope = null;
var SHAKE_AMPLITUDE = 20;
var CLIENT_UPDATE_FREQUENCY = 10;
var trackName = 'default';
var clientUpdateTimer = 0;
var player;
var myId = 0;
var keysDown = []; //37:left, 39:right
var kickers = [];
var rails = [];
var particles = [];
var slopeSegments = [];
var trees = [];
var players = [];
var soundIds = {
  rail: 0,
  noise: 0,
};

var sound = {
  play: function(e) {
    soundIds[e] = sounds.play(e);
  },
  stop: function(e) {
    sounds.stop(soundIds[e]);
  },
  setVolume: function(e, vol) {
    sounds.volume(vol, soundIds[e]);
  },
};

var sounds = new Howl({
  src: ['sounds.mp3'],
  sprite: {
    rail: [0, 3000],
    noise: [4500, 2000],
    clang: [8000, 500],
  },
  onload: function() {
    soundIds.noise = sounds.play('noise');
    sounds.loop(true, soundIds.noise);
    sounds.volume(0, soundIds.noise);
  },
});

var input = {
  topId: 0,
  direction: new Vector(0, -100),
};

var camera = {
  x: 0,
  y: 200,
  update: function() {
    this.x = player.position.x;
    this.y = player.position.y;
    ctx.translate(-this.x + canvas.width / 2, -this.y + canvas.height / 1.3);
    ctx.translate(
      Math.cos(Date.now() * 0.08) * shakeCounter * SHAKE_AMPLITUDE,
      0.5 * Math.sin(Date.now() * 0.08) * shakeCounter * SHAKE_AMPLITUDE
    ); //shaking
  },
};

window.onload = initGame;

function initGame() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loadGame();
  loop();
}

function loadGame() {
  player = new Player(0, -0, true);
  kickers = [];
  rails = [];
  slopeSegments = [];
  trees = [];
  createKickers();
  createRails();
  createSlopeSegments();
  createTrees();
  restartLevel();
}

function restartLevel() {
  player.position.set(0, -850);
  player.z = 0;
  player.vZ = 0;
  player.velocity.zero();
  player.direction.set(0, -1);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

function update() {
  DT = (TIME_RATE * DTMS) / 1000;
  shakeCounter = Math.max(0, shakeCounter - DT);
  updateSlope();
  player.update();
  createParticles();
  players.forEach(function(e) {
    e.update(true);
  });
  particles.forEach(function(e) {
    e.update();
  });
  particles = particles.filter(function(e) {
    return e.active;
  });
}

function render() {
  canvas.width = canvas.width;
  camera.update();

  drawGround();
  drawShadows();
  kickers.forEach(function(e) {
    e.draw();
  });
  particles.forEach(function(e) {
    e.draw('snow');
  });
  rails.forEach(function(e) {
    e.draw();
  });
  particles.forEach(function(e) {
    e.draw('spark');
  });
  players.forEach(function(e) {
    e.draw();
  });
  player.draw();
  trees.forEach(function(e) {
    e.draw();
  });
}

function drawShadows() {
  player.drawShadow();
  players.forEach(function(e) {
    e.drawShadow();
  });
  trees.forEach(function(e) {
    e.drawShadow();
  });
  kickers.forEach(function(e) {
    e.drawShadow();
  });
  rails.forEach(function(e) {
    e.drawShadow();
  });
}

function getPlayerById(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id === id) return players[i];
  }
}

function onServerUpdate(data) {
  for (var id in data) {
    var player = getPlayerById(id);
    if (!player) {
      if (id !== window.myId) {
        player = new Player(data[id].x, data[id].y);
        player.newUpdate = data[id];
        player.oldUpdate = data[id];
        player.id = id;
        player.lastUpdateTime = Date.now();
        players.push(player);
      }
    } else {
      player.oldUpdate = player.newUpdate;
      player.newUpdate = data[id];
      player.lastUpdateTime = Date.now();
    }
  }
}

function onLoadTrack(name) {
  trackName = name;
}

function onNewBuffer(buffer, id) {
  var player = getPlayerById(id);
  if (player) {
    player.runCounter = 0;
  } else {
    player = new Player(0, 0);
    player.id = id;
    player.runCounter = 0;
    players.push(player);
  }
}
