import { makeSprite, t } from "@replay/core";

export const turtleWidth = 30;
export const turtleHeight = 30;


// T for Texture
export const Turtle = makeSprite({
  render() {
    return [
      t.rectangle({
        width: turtleWidth,
        height: turtleHeight,
        color: "green",
      }),
    ];
  },
});
