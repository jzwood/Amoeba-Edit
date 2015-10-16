/*	p5 experimenting with a distraction-filled text editor
 *	Jake Wood 9/15	
 *
 */ 

var allAmoebas, incr;
var allMold;
var mic;
var bgcolors;//handles the background color transition

function setup(){
	var sketch =  createCanvas(windowWidth, windowHeight)
  		.parent("sketch-container");
	
	mic = new p5.AudioIn();
	mic.start();

	allAmoebas = new collection();//initialize collection of amoeba automata
	incr = 1;//the default increment each amoeba moves forward each frame

  	for(var i=0; i<15; i++){
	  	allAmoebas.add(new amoeba());
	};

	allMold = new mold();
	bgcolors = ["#3B3131","#453B3A","#4F4442","#584E4B","#625754","#6C615D","#766A66","#80746E","#897D77","#938780","#9D9088","#A79A91","#B1A49A","#BAADA3","#C4B7AC","#CEC0B4","#D8CABD","#E2D3C6","#EBDDCE","#F5E6D7","#FFF0E0"];
}

function draw() {
  	background(getBackground());
	incr = 1 + Math.pow(1 * (10 * mic.getLevel()),2);
	
  	//re-seeds mold iff it's all eaten
	allMold.respawn();
  	if(frameCount % 100 === 0){//change mod back to 100
  		allMold.grow();
		}
	allMold.draw();
  	allAmoebas.drawAmoebas();
}

function getBackground(){
	if(minute() === 0){
		var colorIndexLimit = bgcolors.length - 1;//number of colors
		var colorindex = Math.floor(second()/60 * colorIndexLimit);
		if(hour()%2 === 0){
			return bgcolors[colorindex];
		}
		return bgcolors[colorIndexLimit - colorindex];
	}//implicit else
	if(hour()%2 === 0){
		document.getElementById("night-day?").innerHTML = "&nbsp;|&nbsp;Day";
		return "#FFF0E0";
	}
	document.getElementById("night-day?").innerHTML = "&nbsp;|&nbsp;Night";
	return"#3B3131";//implicit else
};

//proof of concept -- not currently used
function getBackground_poc(){
	var colorIndexLimit = bgcolors.length - 1;//number of colors
	var colorindex = Math.floor(second()/60 * colorIndexLimit);
	if(minute()%2 === 0){
		//console.log( colorindex);
		return bgcolors[colorindex];
	}
	//console.log(colorIndexLimit - colorindex);
	return bgcolors[colorIndexLimit - colorindex];
	
};

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isObjEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

//just useful. returns if a list/string is []/'' respectively
Object.prototype.isEmpty = function(){
  return (this.length === 0);
}

function randPos(dimension){
	return Math.floor(dimension*Math.random());
}

//collection class
function collection(){
	this.size = 0;
	this.entities = [];
	this.add = function(organism){
		this.entities.push(organism);
		this.size++;
	};

	this.get = function(n){
		if (!this.entities.isEmpty() && n >= 0 && n < this.entities.length){
			return this.entities[n];
		}
	};

	this.drawAmoebas = function(){
		for(var a=0, max=this.entities.length; a<max; a++){ //iterates through amoebas to update/draw
			this.entities[a].update();
			this.entities[a].draw();
		}
	};
}

//returns distance between two entities on toroid
function distTo(one, two){
	var dx = Math.min( Math.abs(two.x - one.x) , width - Math.abs(two.x - one.x)  ); 
	var dy = Math.min( Math.abs(two.y - one.y) , height- (two.y - one.y) );
	return Math.sqrt(dx*dx + dy*dy); 
	//return Math.sqrt((am2.x - am1.x) * (am2.x - am1.x) + (am2.y - am1.y,2) * (am2.y - am1.y,2));
}

//The algorithm below returns the positive mod value, cuz javascript doesn't do smart %
function mod(val, base){
    var temp = val%base;
    while (temp < 0){
        temp += base;
    }
    return temp;
}


//amoeba class
function amoeba(){
	this.x = randPos(width);
	this.y = randPos(height);
	this.dir = Math.random() * Math.PI * 2;//Math.PI/2;
	//this.incr = Math.random()+0.5;//1;
	this.angle = 0.3;//determines how sharply amoebas move
	this.radiusLim = 40;
	this.color = "#3B3131";

	this.forward = function(){
		var nearNeigh = this.nearest();
		noFill();
		if (distTo(this,nearNeigh) > this.radiusLim){
			stroke("black");
		 	this.dir += this.angle*(Math.random()-0.5);//far from others, moves freely
		}else{
			stroke("#800000");
		 	var phi = Math.atan(nearNeigh.y - this.y, nearNeigh.x - this.x);
		 	var diff = mod(this.dir - phi, 2*Math.PI);
		 	if(diff > 0 && diff < Math.PI/2){
		 		this.dir += this.angle;
		 	}else if(diff > 2*Math.PI/3 && diff < 2*Math.PI){
				this.dir -= this.angle;
		 	}else{
		 		this.dir += this.angle*(Math.random()-0.5);
		 	}
		}
		ellipse(this.x,this.y,this.radiusLim,this.radiusLim);//shows intersection radius
		//this.x -= this.incr * Math.cos(this.dir);
		//this.y += this.incr * Math.sin(this.dir); //y dir reversed
		this.x -= incr * Math.cos(this.dir);
		this.y += incr * Math.sin(this.dir); //y dir reversed
	};

	this.nearest = function(){
		var closest; // nearest amoeba
		var minDist = Math.sqrt(width * width + height * height); //largest possible dist on a screen
		for(var n=0, number = allAmoebas.size; n<number; n++){
			var neighbor = allAmoebas.get(n);
			if(this !== neighbor){
				var dist = distTo(this, neighbor);
				if (dist < minDist){
					closest = neighbor;
					minDist = dist;
				}
			}
		}
		return closest;
	};

	this.wrapPos = function(){ //turns universe into toroid, ie screen wrap-around
		this.dir = mod(this.dir, 2*Math.PI);
		this.x = mod(this.x, width);
		this.y = mod(this.y, height);
	};

	this.update = function(){
		this.forward();
		this.wrapPos();
	};
	this.draw = function(){
		push();
		fill(this.color);
		noStroke();
		translate(this.x, this.y);
		rotate(-this.dir);
		ellipse(0,0,15, 10);
		fill("white");
		stroke("black");
		ellipse(0,0,5,5);
		pop();
	};
}


//mold cell class
function spore(x,y){
	this.x = mod(x, width);
	this.y = mod(y, height);
}

//mold class
function mold(){
	var x = randPos(width/2) + (3/8)*width;
	var y = randPos(height);

	//this.color = ["#fee8c8","#fdbb84","#e34a33"];
	//this.color = ["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"];
	this.color = ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"];
	this.cells = {'0,0':new spore(x,y)};
	var step = 15;
	var growthLimit = 700;//smaller?
	
	this.logSize = function(){
		console.log(Object.keys(allMold.cells).length);
	};

	this.randCoorAdj = function(){
		return Math.floor(Math.random()*3) - 1; // return -1, 0, or +1
	};

	this.randNeigh = function(key){ //return key +/- the x and y of key
		key = key.split(',');
		var k1 = parseInt(key[0]);
		var k2 = parseInt(key[1]);
		return String(k1 + this.randCoorAdj()) + ',' + String(k2 + this.randCoorAdj());
	};

	//does a cell have another cell above,left,right, and below?
	this.surrounded = function(cellId){
		cellId = cellId.split(',');
		var xs = cellId[0], ys = cellId[1];
		var xi = parseInt(xs), yi = parseInt(ys);

		var surr = (this.cells[String(xi+1)+','+ys] !== undefined && 
			this.cells[xs+','+String(yi+1)] !== undefined &&
			this.cells[String(xi-1)+','+ys] !== undefined &&
			this.cells[xs+','+String(yi-1)] !== undefined);
		return surr;
	};

	//expands the perimeter randomly outward
	this.grow = function(){
		var keys = Object.keys(this.cells);//key list
		if (keys.length < growthLimit){
			for(var id=0, size=keys.length; id<size; id++){
				var key = keys[id];
				var newId = this.randNeigh(key);

				if(this.cells[newId] === undefined){
					var cell = this.cells[key];
					var splitId = newId.split(',');
					//new cell translated relative to mold origin
					this.cells[newId] = new spore(x + step * parseInt(splitId[0]), y + step * parseInt(splitId[1]));
				}
				//do nothing
			}
		}
	};

	//returns one of 3 colors based on location
	this.getColor = function(width, height){
		//console.log(width + " " + height);
		return Math.ceil(width/3 + height/2)%6;//pseudo random number on interval [0,2]
	};
	
	//removes a cell from mold group
	this.remove = function(cellId){
		delete this.cells[cellId];//this form of delete IS important
	};
	
	//if mold dies it respawns
	this.respawn = function(){
		if (isObjEmpty(this.cells)){
			//first line is just an unnecesary precaution...deletes everything in cell
			for (var prop in this.cells) { if (this.cells.hasOwnProperty(prop)) { delete this.cells[prop]; } }
			x = randPos(width/2) + (3/8)*width;//if all the spores die, resets the 
			y = randPos(height);// (x,y) origin spawns a fresh seed spore
			this.cells = {'0,0':new spore(x,y)};
		}
	};

	this.draw = function(){
		//stroke(255, 102, 0);
		//noStroke();
		noFill();

		var keys = Object.keys(this.cells);//key list
		var removeTheseKeys = [];
		for(var id=0, size=keys.length; id<size; id++){
			//first determine if cell is eaten by an amoeba
			var cellId = keys[id];
			var cell = this.cells[cellId];
			
			for(var i=0, max=allAmoebas.entities.length; i<max; i++){
				//iterate through amoeba. poor use of globals, I know (sigh).
				if (distTo(cell, allAmoebas.entities[i]) < step){ 
					this.remove(cellId);
					break;
				}
			}
			if(!this.surrounded(cellId)){ //doesn't draw interior mold (aesthetic decision only)
				var mx = cell.x, my = cell.y;
				fill(this.color[this.getColor(mx,my)]);
				stroke("black");
				ellipse(mx, my, step, step);
			}
		}
	};
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}