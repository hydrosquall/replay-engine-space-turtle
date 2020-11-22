// import { SpriteBaseProps } from '@replay/core';
// import { SpriteBaseProps } from "@replay/core/props";
import { makeSprite, t} from "@replay/core";

import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";


// export const turtleWidth = 30;
// export const turtleHeight = 30;

// Color picker
// https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=536DFE

type SpriteBaseProps = any; // can't import

type Props = {
  turtleRadius: 15

};
type State = {
  frame: number;
  localFrame: number; // time to spend in 1 turtle state
};


// T for Texture
export const Turtle = makeSprite<Props, State, WebInputs | iOSInputs>({
  init() {
    return {
      frame: 0,
      localFrame: 0,
    };
  },

  loop({ state, props }) {

    // Prevent turtle animation from looping too fast.
    const shouldAnimate = (props as SpriteBaseProps).rotation !== 0;
    const shouldIncrementLocalFrame = shouldAnimate && state.localFrame < 10; // local

    return {
      frame: shouldIncrementLocalFrame || !shouldAnimate ? state.frame : state.frame + 1,
      localFrame: shouldIncrementLocalFrame ? state.localFrame + 1 : 0,
    };
  },
  render({ props, state }) {

    const turtleWidth = props.turtleRadius * 2;

    return [

      t.circle({
        radius: turtleWidth,
        color: "#4ebaaa",
      }),
      t.circle({
        radius: turtleWidth - 5,
        color: "white",
      }),

      t.spriteSheet({
        fileName: "turtle.png",
        columns: 4,
        rows: 1,
        index: state.frame % 4,
        width: turtleWidth,
        height: turtleWidth,
      }),


      // t.rectangle({
      //   width: turtleWidth,
      //   height: turtleHeight,
      //   color: "#4ebaaa",
      // }),
    ];
  },
});
