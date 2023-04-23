import p5Types from "p5";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export const pileFinger = (
  p5: p5Types,
  hands: {
    left: handPoseDetection.Keypoint[];
    right: handPoseDetection.Keypoint[];
  }
) => {
  // --
  // <> pinky
  // <> ring
  // <> middle
  // <> index
  // <> thumb
  // --
  // if one hand is detected, both side of organ is shrink / extend.
  // if two hands are detected, each side of organ changes according to each hand.
  const r = 50;
  const offset = 60;
  const fingerNames = [
    "thumb",
    "index finger",
    "middle finger",
    "ring finger",
    "pinky",
  ];
  let start: number = 0;
  let end: number = 0;

  if (hands.left.length == 0) {
    hands.left = hands.right;
  } else if (hands.right.length == 0) {
    hands.right = hands.left;
  }

  [hands.left, hands.right].forEach((hand, index) => {
    p5.push();
    p5.translate(0, (2 * window.innerHeight) / 3);

    for (let n = 0; n < 5; n++) {
      if (n === 0) {
        p5.translate(window.innerWidth / 2, 0);
      } else {
        let h0_d = hands.left[end].y - hands.left[start].y;
        let h1_d = hands.right[end].y - hands.right[start].y;
        if (r < p5.abs(h0_d)) {
          h0_d = -r;
        } else if (h0_d > 0) {
          h0_d = 0;
        }

        if (r < p5.abs(h1_d)) {
          h1_d = -r;
        } else if (h1_d > 0) {
          h1_d = 0;
        }
        p5.translate(0, (3 * (h0_d + h1_d)) / 2);
        p5.rotate(-Math.atan2(3 * (h0_d - h1_d), 2 * offset));
      }

      //   p5.rotate(
      //     p5.atan2(hands[0][end].y - hands[1].y, hands[0][end].x - hands[1].x)
      //   );

      start = 4 * n + 1;
      end = 4 * n + 4;

      p5.push();
      p5.translate((-1) ** (1 - index) * offset, 0);
      const d = hand[end].y - hand[start].y;
      //   if (index === 1) {
      //     if (r < p5.abs(d)) {
      //       p5.line(offset, 0, offset, -3 * r);
      //     } else if (d > 0) {
      //       p5.line(offset, 0, (3 * r) / 2, 0);
      //     } else {
      //       p5.line(offset, 0, offset + p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2);
      //       p5.line(
      //         offset + p5.sqrt(r ** 2 - d ** 2),
      //         (3 * d) / 2,
      //         offset,
      //         3 * d
      //       );
      //     }
      //   } else if (d > 0) {
      //     p5.line(-offset, 0, -(3 * r) / 2, 0);
      //   } else {
      //     if (r < p5.abs(d)) {
      //       p5.line(-offset, 0, -offset, -3 * r);
      //     } else {
      //       p5.line(-offset, 0, -offset - p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2);
      //       p5.line(
      //         -offset - p5.sqrt(r ** 2 - d ** 2),
      //         (3 * d) / 2,
      //         -offset,
      //         3 * d
      //       );
      //     }
      //   }

      if (index === 1) {
        if (r < p5.abs(d)) {
          p5.line(0, 0, 0, -3 * r);
        } else if (d > 0) {
          p5.line(0, 0, (3 * r) / 2, 0);
        } else {
          p5.line(0, 0, p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2);
          p5.line(p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2, 0, 3 * d);
        }
      } else if (d > 0) {
        p5.line(0, 0, -(3 * r) / 2, 0);
      } else {
        if (r < p5.abs(d)) {
          p5.line(0, 0, 0, -3 * r);
        } else {
          p5.line(0, 0, -p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2);
          p5.line(-p5.sqrt(r ** 2 - d ** 2), (3 * d) / 2, 0, 3 * d);
        }
      }
      p5.push();
      p5.translate(0, 30);
      p5.noStroke();
      p5.textAlign(p5.CENTER);
      p5.textSize(15);
      p5.fill(255);
      p5.text(fingerNames[n], 0, 0);
      p5.pop();

      p5.pop();
    }

    p5.pop();
  });
};
