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
import { updateLost } from "../lib/updateLost";
import { updateStyleIndex } from "../lib/updateStyleIndex";

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
  let lost: { state: boolean; prev: boolean; at: number } = {
    state: false,
    prev: false,
    at: 0,
  };
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

    p5.background(57, 127, 173);
    p5.push();

    lost = updateLost(rawHands, lost);
    styleIndex = updateStyleIndex(lost, styleIndex, functions.length);

    if (!lost.state) {
      if (instructionRef.current) instructionRef.current.style.display = "none";
    }

    if (lost.state && new Date().getTime() - lost.at > 3000) {
      // ユーザが存在しない状態（=トラックされていない状態）が一定時間以上経過したら
      //instructionの表示
      if (instructionRef.current)
        instructionRef.current.style.display = "block";
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
