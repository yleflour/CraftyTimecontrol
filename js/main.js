function trimFrom(obj, n){
    for(var key in obj)
        if(key > n)
            delete obj[key];
};

$(document).ready(function(event){
    $('.nav-tabs').button();
    
    //CRAFTY
    Crafty.init(600,400);
    Crafty.background('rgb(0,0,0)');
    Crafty.timeControl.start();
    
    //SLIDER
    slider = $("#slider").slider({
        min: -10,
        max: 10,
        step: 1,
        value: 0,
        selection: 'none',
        handle: 'round'
    });
    slider.on('slideStart', function(e){
        Crafty.timeControl.pause(true);
    });
    slider.on('slide', function(e){
        clearInterval(slider.timer);
        slider.timer = setInterval(function(){
            if(e.value > 0)
                Crafty.timeControl.goBy(e.value * e.value);
             else if(e.value < 0)
                Crafty.timeControl.goBy(-(e.value * e.value));
        }, 100);
    });
    slider.on('slideStop', function(e){
        clearInterval(slider.timer);
        slider.slider('setValue', 0);
    });
    
    //NumInput
    numInput = $("#numInput").tooltip();
    numInput.setValue = function(n){
        this.val(n);
    };
    numInput.change(function(){
        Crafty.timeControl.goTo(numInput.val());
    });
    
    //BUTTONS
    $("#rec").click(function(){
        Crafty.timeControl.record();
    }).tooltip();
    
    $("#play").click(function(){
        Crafty.timeControl.replay();
    }).tooltip();
    
    $("#pause").click(function(){
        Crafty.timeControl.pause();
    }).tooltip();
    
    $("#reload").click(function(){
        Crafty.timeControl.goTo(0);
    }).tooltip();
    
    //Time control linking
    Crafty.timeControl.bindTo(numInput);
    
    //Crafty launch
    Crafty.scene("sc1");
    Crafty.timeControl.pause();
    
});