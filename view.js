var decode = {
  all: function(obj) {
    var data = obj.data;
    player = new Player(0, -500);
    kickers = [];
    rails = [];
    slopeSegments = [];
    trees = [];
    data.kickers.forEach(function(e) {
      kickers.push(new Kicker(e.x, e.y, e.width, e.height, e.z));
    });
    data.rails.forEach(function(e) {
      rails.push(new Rail(e.x, e.y, e.height, e.z));
    });
    data.trees.forEach(function(e) {
      trees.push(new Tree(e.x, e.y));
    });
    data.slopeSegments.forEach(function(e) {
      slopeSegments.push(new SlopeSegment(e.height, e.angle));
    });
  },
};
