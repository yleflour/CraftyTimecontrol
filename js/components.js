Crafty.scene("sc1", function(){
    Crafty.e('Player');
    Crafty.e('MovingBlock');
});

Crafty.c('Player', {
    init: function(){
         this.requires('Canvas, 2D, Fourway, Color, Draggable, Collision')
         .attr({
              x: 50,
              y: 50,
              w: 32,
              h: 32
         })
         .color('rgb(255,255,255)')
         .fourway(5);
    } 
});

Crafty.c('MovingBlock', {
    yDir: 1,
    speed: 1,
    
    
    init: function(){
        this.requires('Canvas, 2D, Color, Collision')
          .attr({
               x: 300,
               y: 10,
               w: 32,
               h: 32
          })
          .color('rgb(255,255,255)');
        this.bind('EnterFrame', this.advance);
        this.onHit('Player', function(){
           this.yDir *= -1;
        });
    },

    advance: function(){
        this.attr({
            y: this.y + this.yDir * this.speed
        });
    }
   
});

Crafty.c('ArenaWall', {
    init: function(){
        this.requires('Canvas, 2D, Color, Collision');
    }
});