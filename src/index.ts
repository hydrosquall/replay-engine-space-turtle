import { makeSprite, t, GameProps } from "@replay/core";
import { WebInputs, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "@replay/swift";

import { Turtle } from "./turtle";
// import { posix } from "path";
import { Engine, World, Bodies, Composite, Body } from "matter-js";

// defined in webpack
declare const ASSET_NAMES: {};

export const options: RenderCanvasOptions = {
  loadingTextures: [
    t.text({
      color: "black",
      text: "Loading...",
    }),
  ],
  assets: ASSET_NAMES,
  dimensions: "scale-up",
};

const TURTLE_SPEED = 10;
const TURTLE_RADIUS = 15;
const ENGINE_STEP = 1000 / 60; // ms

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// const NUM_PARTICLES = 2;
const maybeParticles = parseInt(urlParams.get('nSocks') ?? '', 10 );

const NUM_PARTICLES = isNaN(maybeParticles) ? 15 : maybeParticles;
const MIN_PARTICLE_SIZE = 5;
const MAX_PARTICLE_SIZE = 8;

const TOP_COLOR = '#ff7043';
const BOTTOM_COLOR = '#0094cc';
const TURTLE_COLOR = '#558b2f';

// const NUM_PARTICLES = 25;

const MAX_FRAMES_IN_GRAVITY = 60 * 7; // 10 seconds at 60 fps

export const gameProps: GameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 600,
      height: 400,
      maxWidthMargin: 150,
    },
    portrait: {
      width: 400,
      height: 600,
      maxHeightMargin: 150,
    },
  },
  defaultFont: {
    name: "Courier",
    size: 10,
  },
};

type GameState = {
  posX: number;
  posY: number;
  targetX: number;
  targetY: number;
  framesInCurrentGravity: number;
};

// Globals so that the game loop can see them.
const engine = Engine.create();
const turtleBody = Bodies.circle(
      0,0, TURTLE_RADIUS,
      {
        render: {
          fillStyle: TURTLE_COLOR
        }
      }
    )

// Depending on size of device
const checkIfGameEnded = () => {
  const allBodies = Composite.allBodies(engine.world);
  const particleBodies = allBodies.filter(body => body.circleRadius && body.render.fillStyle !== TURTLE_COLOR);
  // const numParticles = allBodies.length
  // console.log(particleBodies.length);
  // console.log(particleBodies.map(body => `color: ${body.render.fillStyle} ${body.position.y}`))

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const body = particleBodies[i];
    // if (body.render.fillStyle === TOP_COLOR) {
    //   console.log('top', body.position.y);
    // }
    // Check if it's in wrong spot
    if (body.render.fillStyle === BOTTOM_COLOR && body.position.y < 0) {
      return false;
    }
    if (body.render.fillStyle === TOP_COLOR && body.position.y > 0) {
      return false;
    }
  }

  return true;
}

export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init({ props, device }) {

    const { size } = device;

    const circleBodies = new Array(NUM_PARTICLES).fill(0).map((_) => {
      return Bodies.circle(
        (-device.size.width / 2) + Math.floor((device.random() * size.width)),
        (-device.size.height / 2) + Math.floor((device.random() * size.height) ),
        Math.floor((device.random() * MAX_PARTICLE_SIZE )) + MIN_PARTICLE_SIZE,
        {
          render: {
            fillStyle: device.random() > 0.5 ? TOP_COLOR : BOTTOM_COLOR
          }
        }
      );
    });

    // Add Points to the world
    World.add(engine.world, circleBodies);
    World.add(engine.world, turtleBody);


    // Add Walls
    // https://github.com/liabru/matter-js/blob/5a0079df1b0a10b4ec5ef5e645d18b3e3910565c/examples/manipulation.js#L54-L60
    // game coordinates in this world start at
    World.add(engine.world, [
        // walls
        Bodies.rectangle(0, size.height / 2, size.width, 5, { isStatic: true }), // TOP
        Bodies.rectangle(-size.width / 2, 0, 5 + TURTLE_RADIUS, size.height, { isStatic: true }), // LEFT
        Bodies.rectangle((size.width / 2) - 5, 0, 10, size.height, { isStatic: true }), // RIGHT
        Bodies.rectangle(0, - size.height / 2, size.width, 5, { isStatic: true }), // bottom
    ]);

    // Adjust world gravity per docs
    engine.world.gravity.y = 0; // -1 to reverse y direction
    engine.world.gravity.x = 0.1; // -1 to reverse y direction

    return {
      posX: 0,
      posY: 0,
      targetX: turtleBody.position.x,
      targetY: turtleBody.position.y,
      framesInCurrentGravity: 0,
    };
  },

  loop({ state, device }) {
    const { pointer, keysDown } = device.inputs;
    const { posX, posY } = state;
    let { targetX, targetY } = state;

    // Include clicking option for those who aren't as quick on the keyboard.
    if (pointer.justPressed) {
      targetX = pointer.x;
      targetY = pointer.y;
    }

    // Turtle Movement
    if (keysDown["ArrowLeft"]) {
      targetX -= TURTLE_SPEED;
      Body.setVelocity(turtleBody, { ...turtleBody.velocity, x: -2});
      // Body.applyForce(turtleBody, {x: 0, y: 0}, {x: -0.5, y: 0 });
    }
    if (keysDown["ArrowRight"]) {
      targetX += TURTLE_SPEED;
      Body.setVelocity(turtleBody, { ...turtleBody.velocity, x: 2 });
    }

    if (keysDown["ArrowUp"]) {
      targetY += TURTLE_SPEED;
      Body.setVelocity(turtleBody, { ...turtleBody.velocity,  y: 2 });
    }
    if (keysDown["ArrowDown"]) {
      targetY -= TURTLE_SPEED;
      Body.setVelocity(turtleBody, { ...turtleBody.velocity,  y: -2 });
    }

    // When difference is small enough, snap to 0
    let deltaX = (targetX - posX) / 10;
    if (Math.abs(deltaX) < 0.01) {
      deltaX = 0;
      targetX = posX;
    }

    let deltaY = (targetY - posY) / 10;
    if (Math.abs(deltaY) < 0.01) {
      deltaY = 0;
      targetY = posY;
    }

    // console.log(deltaX);

    // Physics engine state is stored elsewhere, need to update that
    Engine.update(engine, ENGINE_STEP);
    if (state.framesInCurrentGravity === MAX_FRAMES_IN_GRAVITY) {
      engine.world.gravity.x = engine.world.gravity.x * -1;
    }
    // Body.setPo

    return {
      posX: posX + deltaX,
      posY: posY + deltaY,
      targetX: turtleBody.position.x - TURTLE_RADIUS ,
      targetY: turtleBody.position.y + TURTLE_RADIUS * 2,
      framesInCurrentGravity: state.framesInCurrentGravity === MAX_FRAMES_IN_GRAVITY ? 0 : state.framesInCurrentGravity + 1
    };
  },

  render({ state, device }) {
    let turtleTilt = 0;

    if (state.targetX < state.posX) {
      turtleTilt = -30 * (Math.abs(state.targetX - state.posX) / 30);
    } else if (state.targetX > state.posX) {
      turtleTilt = 30 * (Math.abs(state.targetX - state.posX) / 30);
    }

    if (state.targetY < state.posY) {
      turtleTilt = -30 * (Math.abs(state.targetY - state.posY) / 30);
    } else if (state.targetY > state.posY) {
      turtleTilt = 30 * (Math.abs(state.targetY - state.posY) / 30);
    }

    const worldBodies = Composite.allBodies(engine.world);
    const hasWon = checkIfGameEnded();

    return [
      // background
      // single color rect
      // t.rectangle({
      //   x: 0,
      //   y: 0,
      //   width: device.size.width,
      //   height: device.size.height,
      //   color: '#eceff1'
      // }),
      t.rectangle({
        x: 0,
        y: device.size.height / 4,
        width: device.size.width,
        height: device.size.height / 2,
        color: '#e1f5fe'
      }),

       t.rectangle({
        x: 0,
        y: -device.size.height / 4,
        width: device.size.width,
        height: device.size.height / 2,
        color: '#fff3e0'
      }),
        t.text({
        color: "#1c313a",
        text: hasWon ?  `${NUM_PARTICLES} socks sorted! 🐢 thanks you :)` : "Space Turtle's Unsorted Sock Drawer",
        y: 0,
      }),

      t.text({
        color: "#1c313a",
        text: "Blues",
        y: device.size.height / 2 - 10,
        x: -device.size.width / 2 + 20,
      }),
      t.text({
        color: "#1c313a",
        text: "Oranges",
        y: -device.size.height / 2 + 10,
        x: -device.size.width / 2 + 25,
      }),
      Turtle({
        id: "turtle",
        x: state.posX,
        y: state.posY,
        rotation: turtleTilt,
        turtleRadius: 15
      }),
      ...worldBodies.filter(body => body.circleRadius).map((circleBody) => {
        return t.circle({
          radius: circleBody.circleRadius ?? 1,
          color: circleBody.render.fillStyle ?? 'black',
          x: circleBody.position.x,
          y: circleBody.position.y,
        });
      })
    ];
  },
});
