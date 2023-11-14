function backMenu(){
  window.location.href = "option.html";
}
const { Engine, Render, World, Bodies, Runner, Events, Body, Constraint, MouseConstraint, Mouse } = Matter;

    const engine = Engine.create();
    const render = Render.create({
      element: document.getElementById('canvas-container'),
      engine: engine,
      options: {
        width: 1200,
        height: 600,
        wireframes: false,
        background: 'white',
      },
    });
    Render.run(render);
    const world = engine.world;

    const ground = Bodies.rectangle(600, 600, 1200, 40, { isStatic: true, restitution: 0.5, friction: 0.1 });
    const roof = Bodies.rectangle(600, 0, 1200, 40, { isStatic: true, restitution: 0.5, friction: 0.1 });
    const leftWall = Bodies.rectangle(0, 300, 40, 600, { isStatic: true, restitution: 0.5, friction: 0.1 });
    const rightWall = Bodies.rectangle(1200, 300, 40, 600, { isStatic: true, restitution: 0.5, friction: 0.1 });
    World.add(world, [ground, leftWall, rightWall, roof]);

    const ballRadius = 25;
    const balls = [];
    const obstacles = [];
    let isDrawing = false;
    const constraintsToRemove = [];
    let startX, startY, currentX, currentY;
    let enableBallSpawn = false;
    let enableObstacleSpawn = false;
    let enableObjectLink = false;
    let enableConstraintCreation = false;
    const constraints = [];
    const maxConstraints = 90;
    let selectedObjectA = null;
    let selectedObjectB = null;

    function createBall(x, y) {
      const ball = Bodies.circle(x, y, ballRadius, { restitution: 0.9, friction: 0.1 });
      let constraint = null;

      if (enableObjectLink) {
        const mousePoint = { x, y };
        constraint = Constraint.create({
          pointA: mousePoint,
          bodyB: ball,
          stiffness: 0.001,
          length: 60,
          render: {
            strokeStyle: 'blue',
          },
        });
      }

      World.add(world, ball);

      if (constraint) {
        World.add(world, constraint);
        constraints.push(constraint);
      }

      balls.push(ball);

      if (constraints.length > maxConstraints) {
        World.remove(world, constraints.shift());
      }
    }

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.9,
        render: {
          visible: false,
        },
      },
    });

    Matter.Composite.add(world, mouseConstraint);

    render.mouse = mouse;

    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 1200, y: 600 },
    });

    function createObstacle(x, y, width, height) {
      x = Math.max(0, Math.min(render.options.width - width, x));
      y = Math.max(0, Math.min(render.options.height - height, y));

      const obstacle = Bodies.rectangle(x, y, width, height, {
        restitution: 0.5,
        friction: 0.01,
        density: 0.01,
        isStatic: true,
        render: { fillStyle: '#060a19' }
      });
      World.add(world, obstacle);
      obstacles.push(obstacle);
    }

    document.addEventListener('mousemove', (event) => {
      if (isDrawing) {
        currentX = event.clientX;
        currentY = event.clientY;
      }
    });
   
    document.addEventListener('mousedown', (event) => {
    
      if (enableConstraintCreation && event.button === 0) {
        const clickedObject = getObjectAtMouse(event.clientX, event.clientY);
    
        if (clickedObject) {
          if (!selectedObjectA) {
            selectedObjectA = clickedObject;
          } else if (!selectedObjectB && clickedObject !== selectedObjectA) {
            selectedObjectB = clickedObject;
            createConstraint(selectedObjectA, selectedObjectB);
            selectedObjectA = null;
            selectedObjectB = null;
          }
        }
      }
    });
    

    function getObjectAtMouse(mouseX, mouseY) {
      const objectsAtMouse = Matter.Query.point([...balls, ...obstacles], { x: mouseX, y: mouseY });

      if (objectsAtMouse.length > 0) {
        return objectsAtMouse[0];
      }

      return null;
    }

    function createConstraint(objectA, objectB) {
      const constraint = Constraint.create({
        bodyA: objectA,
        bodyB: objectB,
        stiffness: 0.01,
        length: 30,
        render: {
          strokeStyle: 'blue',
        },
      });

      World.add(world, constraint);
      constraints.push(constraint);

      if (constraints.length > maxConstraints) {
        World.remove(world, constraints.shift());
      }
    }

    document.getElementById('enable-constraint-creation').addEventListener('click', () => {
      enableConstraintCreation = !enableConstraintCreation;
    });

    document.addEventListener('mouseup', () => {
      if (isDrawing) {
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        if (width >= 10 && height >= 10) {
          const centerX = (startX + currentX) / 2;
          const centerY = (startY + currentY) / 2;

          createObstacle(centerX, centerY, width, height);
        }

        isDrawing = false;
        startX = startY = currentX = currentY = undefined;
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (enableBallSpawn && event.button === 0) {
        createBall(event.clientX, event.clientY);
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (enableObstacleSpawn && event.button === 0) {
        isDrawing = true;
        startX = event.clientX;
        startY = event.clientY;
      }
    });

    document.getElementById('enable-ball-spawn').addEventListener('click', () => {
      
      enableBallSpawn = !enableBallSpawn;
      if (enableObstacleSpawn == true){
        enableObstacleSpawn = false;
      }
    });

    document.getElementById('enable-obstacle-spawn').addEventListener('click', () => {
      
      enableObstacleSpawn = !enableObstacleSpawn;
      if (enableBallSpawn == true){
        enableBallSpawn = false;
      }
    });

    document.getElementById('enable-object-link').addEventListener('click', () => {
      enableObjectLink = !enableObjectLink;
    });

    document.getElementById('delete-all').addEventListener('click', () => {
      deleteAllBalls();
      deleteAllObstacles();
    });

    function deleteAllBalls() {
      balls.forEach((ball) => {
        const associatedConstraints = constraints.filter((constraint) => {
          return constraint.bodyA === ball || constraint.bodyB === ball;
        });

        associatedConstraints.forEach((constraint) => {
          World.remove(world, constraint);
          const index = constraints.indexOf(constraint);
          if (index !== -1) {
            constraints.splice(index, 1);
          }
        });

        World.remove(world, ball);
      });

      balls.length = 0;
    }

    function deleteAllObstacles(){
      obstacles.forEach((obstacle) => {
        World.remove(world, obstacle);
      });
      obstacles.length = 0;
    }

    const runner = Runner.create();
    Runner.run(runner, engine);

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (balls.includes(bodyA) && bodyB === ground) {
          const randomForce = Math.random() * 0.02 - 0.01;
          Body.applyForce(bodyA, bodyA.position, { x: 0, y: randomForce });
        } else if (balls.includes(bodyB) && bodyA === ground) {
          const randomForce = Math.random() * 0.02 - 0.01;
          Body.applyForce(bodyB, bodyB.position, { x: 0, y: randomForce });
        }
      });
    });