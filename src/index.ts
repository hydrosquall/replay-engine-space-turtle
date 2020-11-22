import { makeSprite, t, GameProps } from "@replay/core";
import { WebInputs, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "@replay/swift";

import { Turtle } from "./turtle";
// import { posix } from "path";
import { Engine, World, Bodies, Composite } from "matter-js";

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

const TURTLE_SPEED = 5;
const TURTLE_RADIUS = 15;

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
};

const engine = Engine.create();

export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init({ props, device }) {
    // const circleA = Bodies.circle(Math.floor(device.random() * device.size.width / 2),
    //                               Math.floor(device.random() * device.size.height / 2), 6 );
    //  const circleB =

    const circleBodies = new Array(5).fill(0).map((_) => {
      return Bodies.circle(
        Math.floor((device.random() * device.size.width) / 2),
        Math.floor((device.random() * device.size.height) / 2),
        Math.floor((device.random() * 5 )) + 2,
        {
          render: {
            fillStyle: device.random() > 0.5 ? 'red': 'blue'
          }
        }
      );
    });

    const turtleBody = Bodies.circle(
      0,0, TURTLE_RADIUS,
      {
        render: {
          fillStyle: 'green'
        }
      }
    )

    World.add(engine.world, circleBodies);
    World.add(engine.world, turtleBody);

    return {
      posX: 0,
      posY: 0,
      targetX: 0,
      targetY: 0,
    };
  },

  loop({ state, device }) {
    const { pointer, keysDown, keysJustPressed } = device.inputs;
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
    }
    if (keysDown["ArrowRight"]) {
      targetX += TURTLE_SPEED;
    }

    if (keysDown["ArrowUp"]) {
      targetY += TURTLE_SPEED;
    }
    if (keysDown["ArrowDown"]) {
      targetY -= TURTLE_SPEED;
    }

    // When difference is small enough, let's just say it matches.
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

    return {
      posX: posX + deltaX,
      posY: posY + deltaY,
      targetX,
      targetY,
    };
  },

  render({ state }) {
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

    return [
      t.text({
        color: "turquoise",
        text: "Hurtle Hockey",
        y: 0,
      }),
      Turtle({
        id: "turtle",
        x: state.posX,
        y: state.posY,
        rotation: turtleTilt,
        turtleRadius: 15
      }),
      ...worldBodies.map((body) => {
        return t.circle({
          radius: body.circleRadius ?? 1,
          color: body.render.fillStyle ?? 'black',
          x: body.position.x,
          y: body.position.y,
        });
      }),
    ];
  },
});
