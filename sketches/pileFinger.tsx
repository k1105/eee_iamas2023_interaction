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
  const r = 150; // <の長さ.
  const offset = 60; // 左右の手指の出力位置の間隔
  const scale = 2.5; // 指先と付け根の距離の入力値に対する、出力時に使うスケール比。
  const fingerNames = [
    "thumb",
    "index finger",
    "middle finger",
    "ring finger",
    "pinky",
  ];
  let start: number = 0;
  let end: number = 0;

  if (hands.left.length > 0 || hands.right.length > 0) {
    //右手、左手のうちのどちらかが認識されていた場合
    // 片方の手の動きをもう片方に複製する
    if (hands.left.length == 0) {
      hands.left = hands.right;
    } else if (hands.right.length == 0) {
      hands.right = hands.left;
    }

    p5.translate(window.innerWidth / 2, (2 * window.innerHeight) / 3);

    for (let n = 0; n < 5; n++) {
      start = 4 * n + 1;
      end = 4 * n + 4;

      const left_d = (hands.left[end].y - hands.left[start].y) * scale;
      const right_d = (hands.right[end].y - hands.right[start].y) * scale;

      [left_d, right_d].forEach((d, index) => {
        const sign = (-1) ** (1 - index); //正負の符号
        p5.push();
        p5.translate(sign * offset, 0);

        if (r < Math.abs(d)) {
          p5.line(0, 0, 0, -r);
        } else if (d > 0) {
          p5.line(0, 0, (sign * r) / 2, 0);
        } else {
          p5.line(0, 0, (sign * Math.sqrt(r ** 2 - d ** 2)) / 2, d / 2);
          p5.line((sign * Math.sqrt(r ** 2 - d ** 2)) / 2, d / 2, 0, d);
        }

        //テキストの描画
        p5.push();
        p5.translate(0, 30);
        p5.noStroke();
        p5.textAlign(p5.CENTER);
        p5.textSize(15);
        p5.fill(255);
        p5.text(fingerNames[n], 0, 0);
        p5.pop();
        p5.pop();
      });

      //全体座標の回転と高さ方向へのtranslate
      let tmp_l_d = 0;
      let tmp_r_d = 0;

      if (r < Math.abs(left_d)) {
        tmp_l_d = -r;
      } else if (left_d > 0) {
        tmp_l_d = 0;
      } else {
        tmp_l_d = left_d;
      }
      if (r < Math.abs(right_d)) {
        tmp_r_d = -r;
      } else if (right_d > 0) {
        tmp_r_d = 0;
      } else {
        tmp_r_d = right_d;
      }

      p5.translate(0, (tmp_l_d + tmp_r_d) / 2);
      p5.rotate(-Math.atan2(tmp_l_d - tmp_r_d, 2 * offset));
    }
  }
};
