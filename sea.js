/*----------------------------------------------------
SEA
simple additive synth to create morphing ambient drones in a browser.
requires p5.js and p5.sound.js
for 16 harmonic partials, aliasing occurs above midi note 88 (E)
possible notes = C (24) to C (48) - therefore covers 2 octaves
*/

new p5(function(p){
	var holder, holderSize, canvas //holder is the parent div
	var partials = []
	var reverb

	var numPartials = 8
	var fundMidi = 36
	var fundHz = p.midiToFreq(fundMidi)
	var fadeTime = 2
	var klang = 30//variable to hold the amount of randomness in pitches (i.e. the detuning of partials), in Hz
	var isPlaying = false

	p.setup = function(){
		//get the parent div for the canvas
		holder = p.select('#sketchContainer')
		//get size of parent div
		var holderSize = holder.size()
		//set canvas to with of parent div - makes sketch responsive
		//make canvas square
		canvas = p.createCanvas(holderSize.width, holderSize.width) 
		p.frameRate(24)
		//global reverb
		verb = new p5.Reverb()
		p.createPartials(function(){
			p.randomiseHz(100) //100% chance
		})
		//bind startStop function to clicking on this canvas element
		canvas.touchStarted(p.startStop)
		p.textFont('monospace')
	}

	//responsively resize canvas if window is resized
	p.windowResized = function(){
		holderSize = holder.size()
		p.resizeCanvas(holderSize.width, holderSize.width)
	}

	//main draw loop
	p.draw = function(){
		p.background(0) //51 = #333
		if(isPlaying){
			p.randomiseHz(0.2)
			p.randomiseAmps(0.7)
		}
		p.drawBars()
		p.writeInfo()
	}

	//click to play
	p.startStop = function(){
		isPlaying = !isPlaying
		if(isPlaying){
			for(var i = 0; i < numPartials; i++){
				partials[i].osc.amp(partials[i].amp, fadeTime)
			}
		} else {
			for(var i = 0; i < numPartials; i++){
				partials[i].osc.amp(0, fadeTime)
			}
		}
	}

	p.randomiseHz = function(chance){ //% chance of happening
		var roll = p.random(0, 100)
		if(roll < chance){
			klang = p.random(0, 200)
			fundMidi = Math.floor(p.random(23, 41)) //from b0 (bottom of 5-string bass) to e2
			fundHz = p.midiToFreq(fundMidi)
			for(var i = 0; i < numPartials; i++){
				var	newHz = p.constrain((fundHz * (i + 1)) + p.random(-klang, klang), 20, 20000)
				partials[i].updateHz(newHz)
			}	
		}
	}

	p.randomiseAmps = function(chance){ //% chance of happening
		for(var i = 0; i < numPartials; i++){
			var roll = p.random(0, 100)
			if(roll < chance){
				partials[i].updateAmp(p.random(0, 0.9))
			}
		}
	}

	p.drawBars = function(){
		p.push()
		var barW = p.width/numPartials;
		p.noFill()
		p.strokeWeight(2)
		p.stroke(100, 240, 255)
		p.beginShape()
		for(var i = 0; i < numPartials; i++){
			var barX = i * barW
			barY = p.map(partials[i].amplitude.getLevel(), 0, 0.75, p.height, 0)
			p.vertex(barX, barY)
			p.vertex(barX + barW, barY)
		}
		p.endShape()
		p.pop()
	}

	p.writeInfo = function(){
		var t = 'randRange > ' + p.equalLen(klang, 6) + '\n'
		for(var i = 0; i < numPartials; i++){
			var h = p.equalLen(partials[i].hz, 6)
			var a = p.equalLen(partials[i].amp, 6)
			t += 'partial '+ i + ' > hz: ' + h + ' amp: ' + a + '\n'
		}
		p.noStroke()
		p.fill(255)
		p.text(t, 10, 20)
	}

	//hacky helper function to slice strings to equal length for nicer display
	p.equalLen = function(i, l){
		return (i + '      ').slice(0, l)
	}

	//callback in here so that frequencies are initialised AFTER the objects are created
	p.createPartials = function(callback){
		for(var i = 0; i < numPartials; i++){
			if(i === 0){
					partials[i] = new p.partial(fundHz, 0.8)
				} else {
					partials[i] = new p.partial(fundHz * (i + 1), 0.1)
			}
		}
		callback()
	}

	//constructor for each partial
	p.partial = function(_hz, _amp){

		//variables
		this.hz = _hz
		this.amp = _amp
		
		//oscillator
		this.osc = new p5.Oscillator()
		this.osc.setType('sine')
		this.osc.freq(this.hz)
		this.osc.amp(0)
		this.osc.disconnect()
		this.osc.connect(verb)
		this.osc.start()
		verb.process(this.osc, 3, 2) //reverb time is 3 and decay is 1%

		// amplitude analysis for visualisation
		this.amplitude = new p5.Amplitude()
		this.amplitude.setInput(this.osc)

		this.updateAmp = function(a){
			this.amp = a;
			this.osc.amp(this.amp, fadeTime)
		}

		//function to update the oscillator frequency inc randomness
		this.updateHz = function(h){
			this.hz = h
			this.osc.freq(this.hz)
		}
	}
}, 'sketchContainer')