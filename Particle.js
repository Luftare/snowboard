function Particle(x, y, type) {
  this.type = type;
  this.position = new Vector(x, y);
  this.velocity = new Vector(0, 0).random(50 * Math.random());
  this.counter = 1;
  this.maxR = 10;
  this.baseR = 2;
  this.r = Math.random() * this.maxR;
  this.active = true;
}

Particle.prototype = {
  update: function() {
    this.counter -= DT;
    this.r = this.baseR + (1 - this.counter) * this.baseR;
    this.position.addScaled(this.velocity, DT);
    if (this.counter < 0) this.active = false;
  },
  draw: function(name) {
    if (name && name !== this.type) return;
    if (this.type === 'spark') {
      ctx.fillStyle = '#FF5';
      ctx.globalAlpha = 1;
      ctx.fillRect(this.position.x, this.position.y, 3, 3);
      ctx.globalAlpha = 1;
    } else if (this.type === 'snow') {
      ctx.fillStyle = 'white';
      ctx.globalAlpha = Math.max(0, this.counter);
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },
};
