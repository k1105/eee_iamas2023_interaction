import dynamic from "next/dynamic";
import { spreadFinger } from "./spreadFinger";
import { organizeFinger } from "./organizeFinger";
import { pileFinger } from "./pileFinger";
import p5Types from "p5";
import { MutableRefObject } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import Image from "next/image";
import { useRef } from "react";

type Props = {
  predictionsRef: MutableRefObject<handPoseDetection.Hand[]>;
};

const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const DisplayFinger = ({ predictionsRef }: Props) => {
  const functions = [spreadFinger, organizeFinger, pileFinger];
  const instructionRef = useRef<HTMLDivElement>(null);
  let styleIndex = 0;
  let lostAt = 0;
  let lost = false;
  let isPlayerExist = false;
  let playerLeftAt = 0;
  const keyflames: [
    handPoseDetection.Keypoint[][],
    handPoseDetection.Keypoint[][]
  ] = [[], []];
  const calcAverageKeypoints = (keyarr: handPoseDetection.Keypoint[][]) => {
    const keys = [];
    if (keyarr.length > 0) {
      for (let i = 0; i < 21; i++) {
        let totalWeight = 0;
        let val = { x: 0, y: 0 };
        for (let j = 0; j < keyarr.length; j++) {
          const weight =
            (keyarr.length - 1) / 2 - Math.abs((keyarr.length - 1) / 2 - j) + 1;
          totalWeight += weight;
          val.x += keyarr[j][i].x * weight;
          val.y += keyarr[j][i].y * weight;
        }
        keys.push({ x: val.x / totalWeight, y: val.y / totalWeight });
      }

      return keys;
    } else {
      return [];
    }
  };
  /**
   * Sketch
   */

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.strokeWeight(10);
  };

  const draw = (p5: p5Types) => {
    if (isPlayerExist) {
      //@ts-ignore
      if (instructionRef.current) instructionRef.current.style.opacity = 0;
    }

    let hands = [];
    p5.background(57, 127, 173);
    p5.push();
    if (typeof predictionsRef.current == "object") {
      try {
        if (predictionsRef.current.length === 0) {
          if (!lost) {
            lost = true;
            lostAt = new Date().getTime();
            playerLeftAt = new Date().getTime();
          }
          if (new Date().getTime() - playerLeftAt > 30000) {
            if (instructionRef.current)
              //@ts-ignore
              instructionRef.current.style.opacity = 1;
          }
        } else {
          isPlayerExist = true;
          if (lost && new Date().getTime() - lostAt > 1000) {
            // //トラッキングがロストしてから1s経ったら
            styleIndex = (styleIndex + 1) % functions.length;
            // styleIndex = 5;
          }
          lost = false;
        }

        for (let index = 0; index < predictionsRef.current.length; index++) {
          keyflames[index].push(predictionsRef.current[index].keypoints);
          if (keyflames[index].length > 5) {
            keyflames[index].shift();
          }
          hands.push(calcAverageKeypoints(keyflames[index]));
        }
        functions[styleIndex](p5, hands);
      } catch (e) {}
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <div
        ref={instructionRef}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-block", marginTop: "30vh" }}>
          <Image
            width={300}
            height={300}
            src={"/img/player.svg"}
            alt="player"
          />
          <p style={{ color: "white" }}>画面の前に手を出してください。</p>
        </div>
      </div>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
