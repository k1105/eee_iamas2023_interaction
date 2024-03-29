import p5Types from "p5";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export const spreadFinger = (
  p5: p5Types,
  hands: {
    left: handPoseDetection.Keypoint[];
    right: handPoseDetection.Keypoint[];
  }
) => {
  [hands.left, hands.right].forEach((hand, index) => {
    if (hand.length > 0) {
      p5.push();
      const fingerNames = [
        "thumb",
        "index finger",
        "middle finger",
        "ring finger",
        "pinky",
      ];

      p5.translate(0, window.innerHeight / 2);

      let start;
      let end;
      for (let n = 0; n < 5; n++) {
        start = 4 * n + 1;
        end = 4 * n + 4;
        p5.push();
        p5.translate((window.innerWidth / 6) * (n + 1), 0);
        p5.push();
        p5.translate(0, 200);
        p5.noStroke();
        p5.textAlign(p5.CENTER);
        p5.textSize(15);
        p5.fill(255);
        p5.text(fingerNames[n], 0, 0);
        p5.pop();
        for (let i = start; i < end; i++) {
          for (let k = 0; k < 5; k++) {
            p5.push();
            p5.rotate((p5.TWO_PI / 5) * k);
            p5.line(
              3 * (hand[i].x - hand[start].x),
              3 * (hand[i].y - hand[start].y),
              3 * (hand[i + 1].x - hand[start].x),
              3 * (hand[i + 1].y - hand[start].y)
            );
            p5.pop();
          }
        }
        p5.pop();
      }

      p5.pop();
    }
  });
};
