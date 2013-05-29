Crafty.extend({
    
    timeControl: {
        _record : {},
        _startingFrame : 0,
        _currentScene : undefined,
        _recording : false,
        _linkedElements : [],
        
        start: function(){
            Crafty.bind("SceneChange", this._onSceneChange);
            this.record();
        },
        
        //Accessible recording methods
        replay: function(){
            this._recording = false;
            //Replay handler
            Crafty.unbind('EnterFrame', this._replayFrame);
            Crafty.bind('EnterFrame', this._replayFrame);

            //Crafty Keyboard handler
            Crafty.unbind('KeyDown', this._onKeyDown);
            Crafty.unbind('KeyUp', this._onKeyup);

            //Crafty DOM event handler (for mouse events)
            Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._onMouseMove);
            Crafty.removeEvent(this, Crafty.stage.elem, "mouseup", this._onMouseUp);
            Crafty.removeEvent(this, Crafty.stage.elem, "mousedown", this._onMouseDown);
            
            return this;
        },
        
        record: function(){
            this._recording = true;
            
            //Replay handler
            Crafty.unbind('EnterFrame', this._replayFrame);

            //Crafty Keyboard handler
            Crafty.unbind('KeyDown', this._onKeyDown);
            Crafty.bind('KeyDown', this._onKeyDown);
            Crafty.unbind('KeyUp', this._onKeyup);
            Crafty.bind('KeyUp', this._onKeyup);

            //Crafty DOM event handler (for mouse events)
            Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._onMouseMove);
            Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._onMouseMove);
            Crafty.removeEvent(this, Crafty.stage.elem, "mouseup", this._onMouseUp);
            Crafty.addEvent(this, Crafty.stage.elem, "mouseup", this._onMouseUp);
            Crafty.removeEvent(this, Crafty.stage.elem, "mousedown", this._onMouseDown);
            Crafty.addEvent(this, Crafty.stage.elem, "mousedown", this._onMouseDown);
            
            return this;
        },
        
        pause: function(state){
            if(state === undefined || state === !Crafty.isPaused())
                Crafty.pause();
            if(!Crafty.isPaused() && this._recording)
                trimFrom(this._record, Crafty.timeControl._relativeFrame());
        },
        
        goTo: function(frame){
            var wasRecording = this._recording;
            
            if(frame < this._relativeFrame() && frame >= 0){
                this.reload();
                this.replay();
                Crafty.timer.simulateFrames(parseInt(frame) + 1);
                if(wasRecording)
                    this.record();
            }
            
            else if(frame > this._relativeFrame()){
                this.replay();
                Crafty.timer.simulateFrames(frame - this._relativeFrame() + 1);
                if(wasRecording)
                    this.record();
            }
        },
        
        goBy: function(frames){
            var wasRecording = this._recording;
            
            if(frames < 0){
                var by = this._relativeFrame() + frames;
                
                if(by < 0) 
                    by = 0;
                
                this.reload();
                this.replay();
                Crafty.timer.simulateFrames(by);
                
                if(wasRecording)
                    this.record();
            }
            
            else if(frames > 0){
                this.replay();
                Crafty.timer.simulateFrames(frames);
                if(wasRecording)
                    this.record();
            }
        },
        
        reload: function(){
            Crafty.scene(this._currentScene);
        },
        
        refresh: function(){
            this.goTo(this._relativeFrame());
        },
        
        bindTo: function(element){
            this._linkedElements.push(element);
            Crafty.bind('EnterFrame', this._onEnterFrame);
        },
        
        //Tools
        _relativeFrame: function(){
            return Crafty.frame() - this._startingFrame;
        },
        
        //Events
        _onSceneChange: function(e){
            Crafty.timeControl._startingFrame = Crafty.frame();
            Crafty.timeControl._currentScene = e.newScene;
            for(var i in Crafty.timeControl._linkedElements)
                Crafty.timeControl._linkedElements[i].setValue(0);
        },
        
        _onEnterFrame: function(e){
            for(var i in Crafty.timeControl._linkedElements)
                Crafty.timeControl._linkedElements[i].setValue(e.frame - Crafty.timeControl._startingFrame);
        },
        
        //Recorder
        _onMouseMove: function(e){
            if(!Crafty.isPaused()){
                var frame = Crafty.timeControl._relativeFrame();
                if(Crafty.timeControl._record[frame] === undefined)
                    Crafty.timeControl._record[frame] = {};
                Crafty.timeControl._record[frame].mouseMove = e;
            }
        },

        _onMouseDown: function(e){
            if(!Crafty.isPaused()){
                var frame = Crafty.timeControl._relativeFrame();
                if(Crafty.timeControl._record[frame] === undefined)
                    Crafty.timeControl._record[frame] = {};
                Crafty.timeControl._record[frame].mouseDown = e;
            }
        },

        _onMouseUp: function(e){
            if(!Crafty.isPaused()){
                var frame = Crafty.timeControl._relativeFrame();
                if(Crafty.timeControl._record[frame] === undefined)
                    Crafty.timeControl._record[frame] = {};
                Crafty.timeControl._record[frame].mouseUp = e;
            }
        },

        _onKeyDown: function(e){
            //console.log("keydown");
            if(!Crafty.isPaused()){
                var frame = Crafty.timeControl._relativeFrame();
                if(Crafty.timeControl._record[frame] === undefined)
                    Crafty.timeControl._record[frame] = {};
                Crafty.timeControl._record[frame].keyDown = e.key;
            }
        },

        _onKeyup: function(e){
            //console.log("keyup");
            if(!Crafty.isPaused()){
                var frame = Crafty.timeControl._relativeFrame();
                if(Crafty.timeControl._record[frame] === undefined)
                    Crafty.timeControl._record[frame] = {};
                Crafty.timeControl._record[frame].keyUp = e.key;
            }
        },

        //Simulator
        _replayFrame: function(){
            function SimulateMouseEvent(e){
                //Crafty.mouseDispatch(e);
            }
            
            var frame = Crafty.timeControl._record[Crafty.timeControl._relativeFrame()];
            if(frame !== undefined){
                if(frame.mouseMove !== undefined){
                    SimulateMouseEvent(frame.mouseMove);
                }
                if(frame.mouseDown !== undefined){
                    SimulateMouseEvent(frame.mouseDown);
                }
                if(frame.mouseUp !== undefined){
                    SimulateMouseEvent(frame.mouseUp);
                }
                if(frame.keyDown !== undefined){
                    //console.log("keyDown");
                    Crafty.trigger("KeyDown", {
                        key: frame.keyDown
                    });
                }
                if(frame.keyUp !== undefined){
                    //console.log("keyUp");
                    Crafty.trigger("KeyUp", {
                        key: frame.keyUp
                    });
                }

            }
        }
    }
});