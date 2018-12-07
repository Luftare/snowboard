function Player(x, y) {
  this.id = null;
  this.width = 10;
  this.height = 40;
  this.z = 0;
  this.vZ = 0;
  this.rotation = 0;
  this.bodyRotation = 0;
  this.position = new Vector(x, y);
  this.xAxisVelocity = new Vector(0, 0);
  this.lastZ = 0;
  this.lastPosition = new Vector(x, y);
  this.direction = new Vector(1, 0);
  this.velocity = new Vector(0, 0);
  this.tail = new Vector(1, 0);
  this.nose = new Vector(1, 0);
  this.friction = new Vector(0, 0);
  this.curving = new Vector(20, 0);
  this.leftmost = new Vector(0, 0);
  this.rightmost = new Vector(0, 0);
  this.angularSpeed = 4;
  this.spin = 0; //store the rotation right before jump
  this.gravityZ = GRAVITY * Math.cos(HILL_ANGLE);
  this.gravityY = new Vector(0, 0);
  this.onKicker = false;
}

Player.prototype.update = function(isOther) {
  if (!isOther) {
    this.handleInput();
    this.handleRotation();
    this.applyForces();
    this.move();
    this.handleCollisions();
    this.updateSounds();
    this.updateServer();
  } else {
  }
};

Player.prototype.updateServer = function() {};

Player.prototype.encodeUpdate = function() {
  var curve = this.curving.length();
  var res = {
    x: this.position.x,
    y: this.position.y,
    a: this.direction.angle(),
    z: this.z,
  };
  if (this.onRail && this.onRail.x) {
    res.r = this.onRail.x;
  }
  if (this.z === 0 && curve) {
    res.c = curve;
  }
  return res;
};

Player.prototype.updateSounds = function() {
  if (this.z === 0) {
    sounds.volume(
      Math.min(
        1,
        this.curving.length() / 300 + 0.0005 * this.velocity.length()
      ),
      soundIds.noise
    );
  } else {
    sounds.volume(0, soundIds.noise);
  }
};

Player.prototype.updateNoseAndTail = function() {
  this.nose
    .alignWith(this.direction)
    .toLength(this.height / 2)
    .add(this.position);
  this.tail
    .alignWith(this.direction)
    .toLength(this.height / 2)
    .mirror()
    .add(this.position);
  this.rightmost.set(this.tail.x > this.nose.x ? this.tail : this.nose);
  this.leftmost.set(this.tail.x < this.nose.x ? this.tail : this.nose);
  this.rightmost.x += this.width / 2;
  this.leftmost.x -= this.width / 2;
};

Player.prototype.applyForces = function() {
  if (!this.onKicker) this.gravityY.set(0, -GRAVITY * Math.sin(HILL_ANGLE));
  this.gravityZ = GRAVITY * Math.cos(HILL_ANGLE);
  this.curving
    .alignWith(this.direction)
    .normal()
    .toLength(this.velocity.cross(this.direction) * CURVING_POWER);
  this.friction
    .set(this.velocity)
    .mirror()
    .toLength(Math.pow(this.velocity.length(), 2) * FRICTION);
  if (this.z === 0) {
    this.velocity.addScaled(this.curving, DT);
    this.velocity.addScaled(this.friction, DT);
    this.velocity.addScaled(this.gravityY, DT);
  }
  if (this.z < 0) {
    if (this.onRail) return;
    this.vZ += this.gravityZ * DT;
  }
};

Player.prototype.handleRotation = function() {
  if (this.z === 0 && !this.onRail) {
    //grounded
    this.direction.lerpAlign(input.direction, this.angularSpeed * DT);
  } else {
    //in the air
    this.rotation += this.spin;
    var newAnle = this.rotation + input.direction.angle() - Math.PI / 2;
    this.direction.toAngle(newAnle);
  }
};

Player.prototype.handleInput = function() {
  if (keysDown[37]) input.direction.rotate(-5 * DT);
  if (keysDown[39]) input.direction.rotate(5 * DT);
  if (keysDown[32]) {
    if (this.z === 0) {
      this.jump(true);
    } else if (this.onRail) {
      input.direction.alignWith(this.direction);
      this.jump(true);
    }
  }
};

Player.prototype.move = function() {
  this.lastZ = this.z;
  this.lastPosition.set(this.position);
  this.z += this.vZ * DT;
  this.position.addScaled(this.velocity, DT);
  this.xAxisVelocity.set(-this.velocity.y, -this.vZ);
  this.updateNoseAndTail();
};

Player.prototype.handleCollisions = function() {
  this.handleTreeCollisions();
  this.handleKickerCollisions();
  this.handleRailCollisions();
  this.handleGroundCollisions();
  this.handleSlopeEdges();
};

Player.prototype.handleSlopeEdges = function() {
  var current = getSegmentByY(this.position.y);
  var prev = getSegmentByY(this.lastPosition.y);
  if (!current) {
    restartLevel();
    return;
  }
  if (current.index !== prev.index) {
    //transition occured
    var angleDelta = prev.angle - current.angle;
    this.xAxisVelocity.rotate(-angleDelta);
    if (angleDelta < 0) this.vZ = -this.xAxisVelocity.y;
    this.velocity.y = -this.xAxisVelocity.x;
    if (this.z === 0 && angleDelta < 0) {
      this.jump(false, 0);
    }
  }
};

Player.prototype.handleRailCollisions = function() {
  var onRailThen = this.onRail;
  this.onRail = false;
  var self = this;
  rails.forEach(function(e) {
    if (e.isBetweenPoints(self.leftmost, self.rightmost)) {
      if (self.z <= -e.z) {
        //above the rail
        if (self.vZ >= 0) {
          //coming down
          if (Math.abs(self.z + e.z) < self.width) {
            self.onRail = e;
            if (!onRailThen && self.onRail) {
              sound.play('rail');
              sound.setVolume('rail', 0.6);
            }
            self.z = -e.z;
            self.vZ = 0;
            self.velocity.x *= 0.97;
          }
        }
      } else {
        //below the rail
        self.velocity.x *= -0.3;
        var margin = 0.1;
        var isLeft = self.position.x < e.x;
        var closest = Math[isLeft ? 'max' : 'min'](self.tail.x, self.nose.x);
        var offset = Math.abs(closest - e.x) + margin;
        self.position.x += isLeft ? -offset : offset;
        shakeWorld(0.3);
        sounds.play('clang');
      }
    }
  });
  if (onRailThen && !this.onRail) sound.stop('rail');
};

Player.prototype.handleKickerCollisions = function() {
  var self = this;
  this.onKicker = false;
  if (this.z === 0 && !this.onRail) {
    kickers.forEach(function(e) {
      if (e.pointInside(self.position)) {
        self.gravityY.set(0, -GRAVITY * Math.sin(HILL_ANGLE - e.angle * 1));
        self.onKicker = e;
      }

      if (e.crossedTop(self.position, self.lastPosition)) {
        self.z = -e.z;
        self.vZ = self.velocity.y * Math.sin(e.angle);
        self.jump();
        return;
      }

      var side = e.crossedSide(self.position, self.lastPosition);
      if (side) {
        if (e.pointInside(self.position)) {
          //entered kicker from side
          if (e.yToZ(self.position.y) > -self.height / 8) return;
          var margin = 0.1;
          self.direction.x *= -0.2;
          self.velocity.x *= -0.2;
          self.position.x = side === 1 ? e.x + e.width + margin : e.x - margin;
        } else {
          //left kicker from side
          self.z = e.yToZ(self.lastPosition.y);
          self.vZ = self.velocity.y * Math.sin(e.angle);
          self.jump();
        }
      }
    });
  }
};

Player.prototype.handleTreeCollisions = function() {
  var self = this;
  trees.forEach(function(e) {
    if (e.position.distanceWithin(self.position, e.r)) {
      shakeWorld(self.velocity.length() * 0.001);
      self.position.set(self.lastPosition);
      self.velocity.scale(-0.5);
    }
  });
};

Player.prototype.handleGroundCollisions = function() {
  if (this.onKicker) return;
  if (this.z > 0) {
    this.onLanding();
  }
};

Player.prototype.onLanding = function() {
  shakeWorld(this.curving.length() * this.vZ * 0.000005 + this.vZ / 1500);
  this.z = 0;
  this.vZ = 0;
  if (this.direction.y > 0) this.direction.mirror();
  input.direction.set(0, -20);
};

Player.prototype.jump = function(onFlat, power) {
  var spin = input.direction.angleBetween(this.direction);
  this.spin = -spin;
  if (power !== undefined) {
    this.vZ += power;
  } else {
    this.vZ += onFlat ? -JUMP_POWER : -JUMP_POWER * 0.2;
  }

  if (onFlat && !this.onRail) this.z = -0.1;
  if (this.onKicker) this.z = this.onKicker.yToZ(this.position.y);
  this.rotation = this.direction.angle();
  this.spin = Math.min(0.1, Math.max(-0.1, this.spin));
  input.direction.set(0, -40);
};
Player.prototype.draw = function() {
  this.drawBoard('#F50');
};

Player.prototype.drawShadow = function() {
  if (this.z > 0) return;
  this.drawBoard(SHADOW_COLOR, -this.z * CAMERA_Z, -this.z * CAMERA_Z);
};

Player.prototype.drawBoard = function(color, x, y, alpha) {
  ctx.lineWidth = this.width;
  x = x || 0;
  y = y || 0;
  ctx.globalAlpha = alpha !== undefined ? alpha : 1;
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(this.nose.x, this.nose.y);
  ctx.lineTo(this.tail.x, this.tail.y);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(this.tail.x, this.tail.y, this.width / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(this.nose.x, this.nose.y, this.width / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.translate(-x, -y);
};
