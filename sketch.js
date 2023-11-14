let flock = [];
let numBoids = 10;
let summon = false;

function summonBoids() {
    summon = true;
    // Create new boids when summoning
    for (let i = 0; i < numBoids; i++) {
        flock.push(new Boid());
    }
}
function backMenu(){
  window.location.href = "option.html";
}
function disbandBoids(){
  summon = false;
  // Clear the flock array when disbanding
  flock = [];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(51);
  
  if (summon == true) {
    for (let boid of flock) {
      boid.update(flock);
      boid.show();
    }
  }
  
  
}
function displayBoid() {
  document.getElementById("boid-count").textContent = flock.length;
}

// Update the count periodically
setInterval(displayBoid, 1000);

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  update(flock) {
    let separation = this.separate(flock);
    let cohesion = this.cohere(flock);
    let alignment = this.align(flock);
    
    separation.mult(1.5); // Adjust the weights of these behaviors
    cohesion.mult(1.0);
    alignment.mult(1.0);

    this.acceleration.add(separation);
    this.acceleration.add(cohesion);
    this.acceleration.add(alignment);

    // Prevent boids from moving off the screen
    this.position.x = constrain(this.position.x, 0, width);
    this.position.y = constrain(this.position.y, 0, height);

    // Add code to make boids move away from the edges
    let edgeForce = createVector(0, 0);
    let edgeDistance = 50; // Adjust this distance as needed

    if (this.position.x < edgeDistance) {
      edgeForce.x = this.maxSpeed;
    } else if (this.position.x > width - edgeDistance) {
      edgeForce.x = -this.maxSpeed;
    }

    if (this.position.y < edgeDistance) {
      edgeForce.y = this.maxSpeed;
    } else if (this.position.y > height - edgeDistance) {
      edgeForce.y = -this.maxSpeed;
    }

    edgeForce.limit(this.maxForce);
    this.acceleration.add(edgeForce);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  separate(flock) {
    let desiredSeparation = 40;
    let steer = createVector();
    let count = 0;

    for (let other of flock) {
      let d = p5.Vector.dist(this.position, other.position);

      if (other != this && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  cohere(flock) {
    let neighborDist = 50;
    let sum = createVector();
    let count = 0;

    for (let other of flock) {
      let d = p5.Vector.dist(this.position, other.position);

      if (other != this && d < neighborDist) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector();
    }
  }

  align(flock) {
    let neighborDist = 50;
    let sum = createVector();
    let count = 0;

    for (let other of flock) {
      let d = p5.Vector.dist(this.position, other.position);

      if (other != this && d < neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector();
    }
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);
    fill(127);
    stroke(200);
    strokeWeight(1);
    triangle(0, -10, -5, 10, 5, 10);
    pop();
  }
}

function mouseMoved() {
  // Make all boids follow the mouse
  for (let boid of flock) {
    boid.acceleration.add(boid.seek(createVector(mouseX, mouseY)));
  }
}
