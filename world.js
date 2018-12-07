var PARTICLE_VECTOR = new Vector();
var PARTICLE_VECTOR2 = new Vector();
var HILL_WIDTH = 2000;

function createParticles() {
  if (player.onRail) {
    var count = Math.floor(1);
    for (var i = 0; i < count; i++) {
      particles.push(new Particle(player.onRail.x, player.position.y, 'spark'));
    }
  } else if (player.z === 0) {
    var count = Math.floor(player.curving.length() / 80);
    for (var i = 0; i < count; i++) {
      PARTICLE_VECTOR2.set(player.tail).substract(player.nose);
      PARTICLE_VECTOR.set(player.nose).addScaled(
        PARTICLE_VECTOR2,
        Math.random()
      );
      particles.push(
        new Particle(PARTICLE_VECTOR.x, PARTICLE_VECTOR.y, 'snow')
      );
    }
  }
}

function shakeWorld(t) {
  shakeCounter = t;
}

function angleToColor(angle) {
  var a = 1 - angle / Math.PI; //max 90  Math.PI*(50/180)+
  a = Math.pow(a, 0.2);
  var r = Math.ceil(255 * Math.pow(a, 3));
  var g = Math.ceil(255 * Math.pow(a, 2));
  var b = Math.ceil(255 * Math.pow(a, 1.5));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function drawGround() {
  slopeSegments.forEach(function(e) {
    e.draw();
  });
}

function createSlopeSegments() {
  slopeSegments.push(new SlopeSegment(900, Math.PI * (80 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (70 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (60 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (50 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (40 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (30 / 180)));
  slopeSegments.push(new SlopeSegment(360, Math.PI * (20 / 180)));
  slopeSegments.push(new SlopeSegment(400, Math.PI * (35 / 180)));
  slopeSegments.push(new SlopeSegment(450, Math.PI * (20 / 180)));
  slopeSegments.push(new SlopeSegment(50, Math.PI * (30 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (40 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (30 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (20 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (10 / 180)));
  slopeSegments.push(new SlopeSegment(100, Math.PI * (5 / 180)));
}

function createKickers() {
  kickers.push(new Kicker(-100, -1600, 200, 100, 20));
  kickers.push(new Kicker(-250, -1750, 100, 50, 5));

  kickers.push(new Kicker(-100, -2400, 200, 100, 35));
  kickers.push(new Kicker(-300, -2450, 100, 50, 10));
  kickers.push(new Kicker(180, -2350, 150, 90, 12));
}
function createRails() {
  rails.push(new Rail(-200, -2100, 290, 20));
  rails.push(new Rail(-250, -2900, 400, 10));
  rails.push(new Rail(260, -2600, 200, 10));
}

function createTrees() {
  var x, y, valid;
  var pos = new Vector(0, 0);
  for (var i = 0; i < 50; i++) {
    valid = true;
    pos.set(400 + Math.random() * 200, -1000 - Math.random() * 2500);
    trees.forEach(function(e) {
      if (e.position.distanceWithin(pos, e.r * 2)) {
        valid = false;
      }
    });
    if (valid) trees.push(new Tree(pos.x, pos.y));
  }
  for (var i = 0; i < 50; i++) {
    valid = true;
    pos.set(-400 - Math.random() * 200, -1000 - Math.random() * 2500);
    trees.forEach(function(e) {
      if (e.position.distanceWithin(pos, e.r * 2)) {
        valid = false;
      }
    });
    if (valid) trees.push(new Tree(pos.x, pos.y));
  }
}

function getSegmentByY(y) {
  for (var i = 0; i < slopeSegments.length; i++) {
    if (
      y > slopeSegments[i].y &&
      y < slopeSegments[i].y + slopeSegments[i].height
    ) {
      return slopeSegments[i];
    }
  }
}

function updateSlope() {
  var slope = getSegmentByY(player.position.y);
  HILL_ANGLE = slope.angle;
}

function SlopeSegment(len, angle) {
  this.height = len;
  this.angle = angle;
  this.y = null; //set upon init call
  this.index = null; //same
  this.init();
}

SlopeSegment.prototype = {
  init: function() {
    this.index = slopeSegments.length;
    var offset = 0;
    for (var i = 0; i < this.index; i++) {
      offset += slopeSegments[i].height;
    }
    this.y = -offset - this.height;
    this.color = angleToColor(this.angle);
  },
  draw: function() {
    var margin = 0;
    var curveLen = 15;
    // curveLen = this.height;
    ctx.fillStyle = this.color;
    ctx.fillRect(-HILL_WIDTH / 2, this.y, HILL_WIDTH, this.height); //this.height);

    var lastColor =
      this.index === 0
        ? this.color
        : angleToColor(slopeSegments[this.index - 1].angle);
    var y0 = this.y + this.height + margin;
    var y1 = this.y + this.height - curveLen - margin;

    var grd = ctx.createLinearGradient(0, y0, 0, y1);

    grd.addColorStop(0, lastColor);
    grd.addColorStop(1, this.color);
    ctx.fillStyle = grd;
    ctx.fillRect(
      -HILL_WIDTH / 2,
      this.y + this.height + margin,
      HILL_WIDTH,
      -curveLen - margin
    );
  },
};

function Tree(x, y) {
  this.position = new Vector(x, y);
}

Tree.prototype = {
  r: 30,
  z: 100,
  toPlayer: new Vector(0, 0),
  layerPos: new Vector(0, 0),
  drawLayer: function(i, len) {
    this.layerPos.set(this.toPlayer).toLength(len * i);
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.layerPos.x,
      this.position.y + this.layerPos.y,
      this.r - i * 6,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fillStyle = i % 2 ? 'green' : 'darkgreen';
    ctx.fill();
  },
  drawShadow: function() {
    ctx.fillStyle = SHADOW_COLOR;
    ctx.beginPath();
    ctx.moveTo(this.position.x + 0.7 * this.r, this.position.y - 0.7 * this.r);
    ctx.lineTo(
      this.position.x + this.z * CAMERA_Z,
      this.position.y + this.z * CAMERA_Z
    );
    ctx.lineTo(
      this.position.x - 0.2 * this.r,
      this.position.y + this.r + 0.0 * this.r
    );
    ctx.closePath();
    ctx.fill();
  },
  draw: function() {
    // ctx.globalAlpha = 0.1;
    this.toPlayer.set(this.position).substract(player.position);
    var dist = this.toPlayer.length();
    dist *= 0.01;
    this.drawLayer(0, dist);
    this.drawLayer(1, dist);
    this.drawLayer(2, dist);
    this.drawLayer(3, dist);
    ctx.globalAlpha = 1;
  },
};
