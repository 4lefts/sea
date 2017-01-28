var holder, holderSize, canvas
var isPlaying = false
var rolling //var for timer to randomise changes
var bgShade = '#323232'

//note stuff
var minorPentatonic = [0, 3, 5, 7, 10]
// choose midi note for fundamental between b0 and e2
var fundamentalMidi = Math.floor((Math.random() * 17) + 23)
//scale to choose notes from when things shift
var currentScale = makeScaleHz(fundamentalMidi, minorPentatonic)

//tone js stuff
var verb = new Tone.Freeverb({
	roomSize: 0.9,
	dampening: 5000,
}).toMaster()

//create 8 partials
var numPartials = 8
var partials = []
var currentNote = currentScale[0]
for(var i = 0; i < numPartials; i++){
	var currentAmp = i == 0 ? -30 : (Math.random() * -20) - 30
	var klang = (Math.random() * (i * 10)) - ((i * 10) / 2) //a random offset to the frequency of the harmonic; greater for higher order harmonics
	partials[i] = new Partial((currentNote * (i + 1)) + klang, currentAmp)
}

function setup(){
	holder = select('#sketchContainer')
	holderSize = holder.size()
	canvas = createCanvas(holderSize.width, holderSize.width)
	canvas.parent('#sketchContainer')
	canvas.mousePressed(startStop)
	frameRate(30)
}

function startStop(){
	isPlaying = !isPlaying
	if(isPlaying){
		rolling = setInterval(function(){
			roll()
		}, 100)
	} else {
		clearInterval(rolling)
	}
	
	partials.forEach(function(element){
		element.toggle(isPlaying)
	})
}

function windowResized(){
	holderSize = holder.size()
	resizeCanvas(holderSize.width, holderSize.width)
}

function draw(){
	background(bgShade)
	drawBars()
	writeLabel('//sea', 48)
}

function drawBars(){
	var w = width/partials.length
	var hs = partials.map((p) => {
		return map(p.meter.value, 0, 0.05, height, 0) 
	})
	var ls = partials.map((p) => {
		return map(p.amp, -72, 0, height, 0)
	})
	noStroke()
	fill(120, 180, 200, 130)
	hs.forEach((h, i) => {
		rect(i * w, h, w, height) 
	})
	noFill()
	stroke(200)
	ls.forEach((l, i) => {
		line(i * w, l, (i * w) + w, l)
	})
}

function writeLabel(txt, sz){
	push()
	noStroke()
	fill(200)
	textSize(sz)
	text(txt, 16, sz + 16)
	pop()
}

/*
------------------------------
Tone JS Synth for each Partial
------------------------------
*/
function Partial(_hz, _amp){
	this.hz = _hz
	this.amp = _amp
	this.meter = new Tone.Meter('Level', 0.1)
	this.osc = new Tone.Oscillator(this.hz, 'sine').connect(this.meter).connect(verb)
	this.osc.volume.value = -Infinity
	this.osc.start()

	this.toggle = function(t){
		if(t){
			this.osc.volume.rampTo(this.amp, 1)
		} else {
			this.osc.volume.rampTo(-Infinity, 1)
		}
	}

	this.updateHz = function(newHz){
		this.hz = newHz
		this.osc.frequency.value = this.hz
	}

	this.updateAmplitude = function(newAmp, time){
		this.amp = newAmp
		this.osc.volume.rampTo(this.amp, time)
	}
}

function midiToFreq(m){
	var x = (m - 69) / 12
	return Math.pow(2, x) * 440
}

function makeScaleHz(fund, scale){
	var ret = scale.map(function(note){
		return midiToFreq(fund + note)
	})
	return ret
}

function updatePartialFreqs(ps, fund){
	ps.forEach(function(p, i){
		var klang = (Math.random() * (i * 20)) - ((i * 20) / 2) //a random offset to the frequency of the harmonic; greater for higher order harmonics
		var f = (fund * (i + 1)) + klang
		p.updateHz(f)
	})
}

function randomiseNote(scale){
	var n = scale[Math.floor(Math.random() * scale.length)]
	return n
}

//function called by setinterval to randomly alter the pitch and the relative amplitude to the partials
function roll(){
	if(isPlaying){
		var r = Math.random()
		if(r > 0.995){
			currentNote = randomiseNote(currentScale)
			updatePartialFreqs(partials, currentNote)
		} else if(r < partials.length / 100){
			p = Math.floor(r * 100)
			partials[p].updateAmplitude((Math.random() * -48) - 24, Math.random())
		}
	}
}
