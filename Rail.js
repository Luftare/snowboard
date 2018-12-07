function Rail(x, y, length, z) {
  this.x = x;
  this.y = y;
  this.height = length;
  this.width = 5;
  this.z = z;
}

Rail.prototype = {
  poleMargin: 0.1,
  isBetweenPoints: function(a, b) {
    var top = a.y < b.y ? a : b;
    var bottom = a.y > b.y ? a : b;
    var left = a.x < b.x ? a : b;
    var right = a.x > b.x ? a : b;
    return (
      left.x < this.x &&
      right.x > this.x &&
      bottom.y < this.y + this.height &&
      top.y > this.y
    );
  },
  draw: function() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  },
  drawShadow: function(attribute) {
    ctx.fillStyle = SHADOW_COLOR;
    ctx.strokeStyle = SHADOW_COLOR;
    ctx.lineWidth = this.width;
    ctx.fillRect(
      this.x - this.width / 2 + this.z * CAMERA_Z,
      this.y + this.z * CAMERA_Z,
      this.width,
      this.height
    );
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.poleMargin * this.height);
    ctx.lineTo(
      this.x + this.z * CAMERA_Z,
      this.y + this.poleMargin * this.height + this.z * CAMERA_Z
    );
    ctx.moveTo(this.x, this.y + this.height - this.poleMargin * this.height);
    ctx.lineTo(
      this.x + this.z * CAMERA_Z,
      this.y + this.height - this.poleMargin * this.height + this.z * CAMERA_Z
    );
    ctx.closePath();
    ctx.stroke();
  },
};
