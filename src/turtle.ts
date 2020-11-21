import { makeSprite, t } from "@replay/core";

export const turtleWidth = 25;
export const turtleHeight = 25;


// Color picker
// https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=536DFE

// T for Texture
export const Turtle = makeSprite({
  render() {
    return [

      t.circle({
        radius: turtleWidth,
        color: "#0043ca",
        // mask: mask.circle({
        //   radius: turtleWidth - 5,
        // })
      }),
      t.circle({
        radius: turtleWidth - 5,
        color: "white",
      }),



      t.rectangle({
        width: turtleWidth,
        height: turtleHeight,
        color: "#4ebaaa",
      }),
    ];
  },
});
