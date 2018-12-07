function Kicker(x, y, width, height, z) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.z = z;
  this.angle = Math.sin(z / height);
}

Kicker.prototype = {
  draw: function() {
    var grd = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    grd.addColorStop(0, 'white');
    grd.addColorStop(1, getSegmentByY(this.y + this.height).color);
    ctx.fillStyle = grd;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, 2);
  },
  drawShadow: function() {
    ctx.fillStyle = SHADOW_COLOR;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, this.y);
    ctx.lineTo(
      this.x + this.width + this.z * CAMERA_Z,
      this.y + this.z * CAMERA_Z
    );
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  },
  yToZ: function(y) {
    if (y > this.y && y < this.y + this.height) {
      return -(1 - (y - this.y) / this.height) * this.z;
    } else {
      return 0;
    }
  },
  pointToZ: function(p) {
    if (this.pointInside(p)) return this.yToZ(p.y);
    return 0;
  },
  pointInside: function(p) {
    return (
      p.x > this.x &&
      p.x < this.x + this.width &&
      p.y > this.y &&
      p.y < this.y + this.height
    );
  },
  crossedSide: function(a, b) {
    //false: no crossing, -1: left, 1: right
    var aInside = this.pointInside(a);
    var bInside = this.pointInside(b);
    if ((aInside && bInside) || (!aInside && !bInside) || a.x === b.x)
      return false; //both either outside or inside or going along y axis
    var top = a.y < b.y ? a : b;
    var bottom = a.y > b.y ? a : b;
    var left = a.x < b.x ? a : b;
    var right = a.x > b.x ? a : b;
    if (top.y < this.y || bottom.y > this.y + this.height) return false; //crossing top/bottom
    //cross must have occured since all other cases have been tested
    return this.pointInside(left) ? 1 : -1;
  },
  crossedTop: function(a, b) {
    var aInside = this.pointInside(a);
    var bInside = this.pointInside(b);
    if ((aInside && bInside) || (!aInside && !bInside)) return false; //both either outside or inside
    var top = a.y < b.y ? a : b;
    var bottom = a.y > b.y ? a : b;
    if (top.y < this.y) return true;
    return false;
  },
};
