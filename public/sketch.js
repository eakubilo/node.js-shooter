let socket;
let users = [];
let bullets = [];
let circleX;
let circleY;
let rbg = [];
let bulletSize;
let bulletSpeed;
let circleSize;
let alreadyAdded;
function setup() {
	createCanvas(600,400);
	background(51);
	bulletSize = 5;
	bulletSpeed = 4;
	circleSize = 36;
	alreadyAdded = false;
	rbg = [Math.floor(random(255)),Math.floor(random(255)),Math.floor(random(255))];
	socket = io.connect('http://localhost:3000');
	socket.on('mouse', addUser);
	socket.on('shoot', pushBullet);
	circleX = width/2;
	circleY = height/2;
}
function pushBullet(data){
	bullets.push(data);
}
function addUser(data){
	let listChecked = false;
	for(let user of users){
		if(user.id == data.id){
			user.x = data.x;
			user.y = data.y;
			listChecked = true;
			break;
		}
	}
	if(!listChecked){
		users.push(data);
		addUser(data);
	}
}
function keyTyped(){
	if(key === 'r'){
		shoot();
	}
}
function shoot(){
	let x = (mouseX - circleX);
	let y = (mouseY - circleY);
	let angle;
	if(x>0 && y>0){
		angle = Math.atan(y/x);
	}else if(x< 0 && y>0){
		angle = Math.atan(y/x) + Math.PI;
	}else if(x<0 && y < 0){
		angle = Math.atan(y/x) + Math.PI;
	}else if(x > 0 && y < 0){
		angle = Math.atan(y/x) + 2*Math.PI;
	}

	
	let data = {
		size: bulletSize,
		color: rbg,
		id: socket.id,
		x: circleX,
		y: circleY,
		xVel: bulletSpeed*Math.cos(angle),
		yVel: bulletSpeed*Math.sin(angle),
	}
	bullets.push(data);
	socket.emit('shoot', data);
}
function emitCircleData() {
	let data = {
		id: socket.id,
		x: circleX,
		y: circleY,
		size: circleSize,
		color: rbg
	}
	if(!alreadyAdded){
		users.push(data);
		alreadyAdded = true;
	}
	for(let user of users){
		if(user.id === socket.id){
			user.x = data.x;
			user.y = data.y;
		}
	}
	socket.emit('mouse', data);
}
function draw() {
	background(51);
	noStroke();
	//draw first user (client)
	checkKeyDown();
	//draw other users(from users array)
	drawUsers();
	checkCollisions();
	drawBullets();
	moveBullets();
	removeBullets();
}
function removeBullets(){
	for(let i = 0; i < bullets.length; i++){
		if(bullets[i].x>width || bullets[i].x < 0 || bullets[i].y > height || bullets[i].y < 0){
			bullets.splice(i,1);
			i--;
		}
	}
}
function checkCollisions(){
	for(let bullet of bullets){
		for(let user of users){
			let hit = collideCircleCircle(bullet.x,bullet.y,bullet.size*2,user.x,user.y,user.size*2)
			console.log(hit);
			if(hit && bullet.id != user.id){
				console.log(`${user.id} has been hit!`);
			}
		}
	}
}
function checkKeyDown(){
	if(keyIsDown(87)){
		circleY -= 5;
		emitCircleData();
	}if(keyIsDown(65)){
		circleX -= 5;
		emitCircleData();
	}if(keyIsDown(83)){
		circleY += 5;
		emitCircleData();
	}if(keyIsDown(68)){
		circleX += 5;
		emitCircleData();
	}
}
function moveBullets(){
	for(let bullet of bullets){
		bullet.x += bullet.xVel;
		bullet.y += bullet.yVel;
	}
}
function drawBullets(){
	for(let bullet of bullets){
		if(bullet.id != socket.id){
			fill(...bullet.color);
			ellipse(bullet.x,bullet.y,bullet.size);
		}else{
			fill(...rbg);
			ellipse(bullet.x,bullet.y,bullet.size);
		}
	}
}
function drawUsers(){
	for(let user of users){
		fill.apply(null, user.color);
		ellipse(user.x,user.y,circleSize,circleSize);
	}
}