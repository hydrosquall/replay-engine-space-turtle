import { makeSprite, t, GameProps } from "@replay/core";
import { WebInputs, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "@replay/swift";

import { Turtle } from './turtle';
import { posix } from "path";

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

export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init() {
    return {
      posX: 0,
      posY: 0,
      targetX: 0,
      targetY: 0,
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
    if (keysDown['ArrowLeft']) {
      targetX -= TURTLE_SPEED;
    }
    if (keysDown['ArrowRight']) {
      targetX += TURTLE_SPEED;
    }

    if (keysDown['ArrowUp']) {
      targetY += TURTLE_SPEED;
    }
    if (keysDown['ArrowDown']) {
      targetY -= TURTLE_SPEED;
    }

    return {
      posX: posX + (targetX - posX) / 10,
      posY: posY + (targetY - posY) / 10,
      targetX,
      targetY,
    };
  },

  render({ state }) {
    return [
      t.text({
        color: "turquoise",
        text: "TurtleShield",
        y: 50,
      }),
      // t.image({
      //   testId: "icon",
      //   x: state.posX,
      //   y: state.posY,
      //   fileName: "icon.png",
      //   width: 50,
      //   height: 50,
      // }),
      Turtle({
        id: 'turtle',
        x: state.posX,
        y: state.posY,
      })
    ];
  },
});
