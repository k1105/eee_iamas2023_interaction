import { useCallback, useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import Webcam from "react-webcam";
import { DisplayFinger } from "../sketches/DisplayFinger";
import { PixelInput } from "@tensorflow-models/hand-pose-detection/dist/shared/calculators/interfaces/common_interfaces";

export default function App() {
  const webcamRef = useRef<Webcam>(null);
  const modelRef = useRef<null | handPoseDetection.HandDetector>(null);
  const predictionsRef = useRef<handPoseDetection.Hand[]>([]);
  const requestRef = useRef<null | number>(null);
  const [ready, setReady] = useState(false);
  const lostCountRef = useRef(0);
  const timer = 120000;

  const capture = useCallback(async () => {
    if (typeof webcamRef.current && modelRef.current) {
      //webcamとmodelのインスタンスが生成されていたら
      const predictions = await modelRef.current.estimateHands(
        (webcamRef.current as Webcam).getCanvas() as PixelInput
      ); //webcamの現時点でのフレームを取得し、ポーズ推定の結果をpredictionsに非同期で格納

      if (predictions) {
        //predictionsが存在していたら
        if (predictions.length > 0) {
          predictionsRef.current = predictions;
          lostCountRef.current = 0;
        } else {
          lostCountRef.current++;
        }

        if (lostCountRef.current > 10) {
          predictionsRef.current = [];
        }
      }
    }

    // need to fix: ready stateが更新されてもなお同じreadyの値がよばれ続けてしまう
    if (ready) {
      requestRef.current = requestAnimationFrame(capture); //captureを実施
    } else {
      //not working
      requestRef.current = null;
    }
  }, [ready]);

  useEffect(() => {
    const load = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: "tfjs",
        modelType: "full",
      } as handPoseDetection.MediaPipeHandsTfjsModelConfig;
      modelRef.current = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );
      modelRef.current = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );
    };

    load();

    setReady(true);
    setInterval("location.reload()", timer);
  }, []);

  useEffect(() => {
    if (ready) {
      requestRef.current = requestAnimationFrame(capture);
    } else {
      if (requestRef.current) {
        console.log("cancel");
        cancelAnimationFrame(requestRef.current); //not working
      }
    }
  }, [capture, ready]);

  return (
    <>
      {/* //optional sketch */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "30px",
          width: "400px",
        }}
      >
        <p>インストラクション Instructions: </p>
        <ol>
          <li>
            まずは片手だけを使って、指を動かしてみてください。
            <br />
            First, try using only one hand and moving your fingers.
          </li>
          <li>
            いったん手を体の後ろに隠し、もう一度、ゆっくりと手を出してみてください。
            <br />
            Try hiding your hands behind your body and slowly bringing them out
            in front of the screen.
          </li>
          <li>
            両手を使って、指を動かしてみてください。
            <br />
            Try using both hands and moving your fingers.
          </li>
        </ol>
      </div>
      {ready && <DisplayFinger predictionsRef={predictionsRef} />}
      <div
        style={{
          position: "absolute",
          right: -190,
          top: -10,
        }}
      >
        <Webcam
          width="200"
          height="113"
          mirrored
          id="webcam"
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
      </div>
      <div
        style={{
          backgroundColor: "rgba(23,32,23,0.3)",
          position: "absolute",
          color: "white",
          display: "flex",
          cursor: "pointer",
          top: 10,
          left: 10,
        }}
      ></div>
    </>
  );
}
