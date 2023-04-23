import dynamic from "next/dynamic";
import { spreadFinger } from "./spreadFinger";
import { organizeFinger } from "./organizeFinger";
import { pileFinger } from "./pileFinger";
import p5Types from "p5";
import { MutableRefObject, useRef } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { updateRawHandsHistory } from "../lib/updateRawHandsHistory";
import { Instruction } from "../components/Instruction";

type Props = {
  rawHandsRef: MutableRefObject<handPoseDetection.Hand[]>;
};

const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const DisplayFinger = ({ rawHandsRef }: Props) => {
  const functions = [spreadFinger, organizeFinger, pileFinger];
  const instructionRef = useRef<HTMLDivElement>(null);
  let styleIndex = 0;
  let lost: { state: boolean; at: number } = { state: false, at: 0 };
  let playerLeft: { state: boolean; at: number } = { state: false, at: 0 };
  let rawHandsHistory: {
    left: handPoseDetection.Keypoint[][];
    right: handPoseDetection.Keypoint[][];
  } = { left: [], right: [] };
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
    const rawHands = rawHandsRef.current;
    if (playerLeft.state) {
      if (instructionRef.current) instructionRef.current.style.opacity = "0";
    }

    p5.background(57, 127, 173);
    p5.push();
    if (rawHands.length === 0) {
      //トラックされていない・トラックがロストした場合の処理
      if (!lost.state) {
        //現在のstateがlostではなかった場合
        lost.state = true;
        lost.at = new Date().getTime();
        playerLeft.at = new Date().getTime();
      }
      if (new Date().getTime() - playerLeft.at > 30000) {
        // ユーザが存在しない状態（=トラックされていない状態）が一定時間以上経過したら
        //instructionの表示
        if (instructionRef.current)
          //@ts-ignore
          instructionRef.current.style.opacity = 1;
      }
    } else {
      //手指の動きが認識された場合
      playerLeft.state = true;
      if (lost.state && new Date().getTime() - lost.at > 1000) {
        // //ロスト復帰したタイミングで、1s以上経過していた場合
        styleIndex = (styleIndex + 1) % functions.length; //表示するスケッチファイルを変更
      }
      lost.state = false;
    }

    rawHandsHistory = updateRawHandsHistory(rawHands, rawHandsHistory); //rawHandsHistoryの更新
    const hands: {
      left: handPoseDetection.Keypoint[];
      right: handPoseDetection.Keypoint[];
    } = getSmoothedHandpose(rawHands, rawHandsHistory); //平滑化された手指の動きを取得する

    if (hands.left.length > 0 || hands.right.length > 0) {
      functions[styleIndex](p5, hands);
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <div ref={instructionRef}>
        <Instruction />
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
