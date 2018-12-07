var Vector = (function() {
  function sign(a) {
    return a < 0 ? -1 : 1;
  }

  function V(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  V.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  V.prototype.zero = function() {
    this.x = this.y = 0;
    return this;
  };

  V.prototype.unitX = function() {
    return this.set(1, 0);
  };

  V.prototype.unitY = function() {
    return this.set(0, 1);
  };

  V.prototype.random = function(a) {
    return this.unitAngle(Math.random() * Math.PI * 2).scale(a || 1);
  };

  V.prototype.unitAngle = function(a) {
    this.x = Math.cos(a);
    this.y = Math.sin(a);
    return this;
  };

  V.prototype.normalize = V.prototype.normalise = function() {
    if (this.x === 0 && this.y === 0) return this;
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return this;
  };

  V.prototype.scale = V.prototype.multiply = function(s) {
    this.x *= s;
    this.y *= s;
    return this;
  };

  V.prototype.log = function(name) {
    console.log((name || 'vector') + ': {x: ' + this.x, ', y: ' + this.y + '}');
  };

  V.prototype.isValid = function() {
    return (
      !isNaN(this.x) &&
      !isNaN(this.y) &&
      typeof this.x === 'number ' &&
      typeof this.y === 'number'
    );
  };

  V.prototype.draw = function(ctx, x, y, color) {
    var _x = x.x !== undefined ? x.x : x;
    var _y = x.y !== undefined ? x.y : y;
    var color = color || 'red';
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(_x, _y);
    ctx.lineTo(_x + this.x, _y + this.y);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(_x + this.x, _y + this.y, 3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return this;
  };

  V.prototype.divide = function(a) {
    return this.scale(1 / a);
  };

  V.prototype.isZero = function() {
    return this.x === 0 && this.y === 0;
  };

  V.prototype.toLength = function(l) {
    if (this.isZero()) return this.set(l, 0);
    return this.normalise().scale(l);
  };

  V.prototype.toAngle = function(a) {
    var len = this.length();
    this.x = Math.cos(a) * len;
    this.y = Math.sin(a) * len;
    return this;
  };

  V.prototype.clampAngle = function(a, b) {
    var angle = this.angle();
    var min = Math.min(a, b);
    var max = Math.max(a, b);
    if (angle < min) return this.toAngle(min);
    if (angle > max) return this.toAngle(max);
    return this;
  };

  V.prototype.rotate = function(a) {
    var len = this.length();
    var s = Math.sin(a);
    var c = Math.cos(a);
    this.x = this.x * c - this.y * s;
    this.y = this.x * s + this.y * c;
    this.toLength(len);
    return this;
  };

  V.prototype.angle = function() {
    return Math.atan(this.y / this.x);
  };

  V.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
  };

  V.prototype.cross = function(v) {
    return this.x * v.y - this.y * v.x;
  };

  V.prototype.crossSign = function(v) {
    return this.cross(v) < 0 ? -1 : 1;
  };

  V.prototype.angleBetween = function(v) {
    var thisL = this.length();
    var vL = v.length();
    this.normalize();
    v.normalize();
    var sign = this.crossSign(v);
    var res = 1 - Math.abs(this.dot(v));
    this.scale(thisL);
    v.scale(vL);
    return sign * Math.abs(res);
  };

  V.prototype.lerpAlign = function(v, angle) {
    var cross = this.cross(v);
    if (cross === 0) return this;
    this.rotate(angle * sign(cross));
    if (sign(this.cross(v)) !== sign(cross)) {
      return this.alignWith(v);
    } else {
      return this;
    }
  };

  V.prototype.clamp = function(a, b) {
    var max = Math.max(a, b);
    var min = Math.min(a, b);
    var len = this.length();
    if (len < min) return this.toLength(min);
    if (len > max) return this.toLength(max);
    return this;
  };

  V.prototype.limit = function(a) {
    var len = this.length();
    if (len > a) return this.toLength(a);
    return this;
  };

  V.prototype.clone = function() {
    return new V(this.x, this.y);
  };

  V.prototype.set = function() {
    if (arguments.length === 1) {
      this.x = arguments[0].x;
      this.y = arguments[0].y;
    } else {
      this.x = arguments[0];
      this.y = arguments[1];
    }
    return this;
  };

  V.prototype.stretch = function(l) {
    return this.toLength(this.length() + Math.abs(l));
  };

  V.prototype.shrink = function(l) {
    return this.toLength(Math.max(0, this.length() - Math.abs(l)));
  };

  V.prototype.magnify = function(l) {
    return this.toLength(Math.max(0, this.length() + l));
  };

  V.prototype.alignWith = function(v) {
    var len = this.length();
    return this.set(v).toLength(len);
  };

  V.prototype.mirror = function() {
    return this.scale(-1);
  };

  V.prototype.normal = function(d) {
    var x = this.x;
    this.x = (!d ? -1 : 1) * this.y;
    this.y = (!!d ? -1 : 1) * x;
    return this;
  };

  V.prototype.normalTo = function(v, d) {
    return this.alignWith(v).normal(d);
  };

  V.prototype.add = function() {
    for (i = 0; i < arguments.length; i++) {
      this.x += arguments[i].x;
      this.y += arguments[i].y;
    }
    return this;
  };

  V.prototype.substract = function() {
    for (i = 0; i < arguments.length; i++) {
      this.x -= arguments[i].x;
      this.y -= arguments[i].y;
    }
    return this;
  };

  V.prototype.addScaled = function(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  };

  V.prototype.distance = function(v) {
    return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2));
  };

  V.prototype.distanceWithin = function(v, range) {
    return (
      range * range > Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2)
    );
  };

  V.prototype.substractVectors = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  };

  V.prototype.addVectors = function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  };
  return V;
})();
