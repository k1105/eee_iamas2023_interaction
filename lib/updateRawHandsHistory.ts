import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export const updateRawHandsHistory = (
  rawHands: handPoseDetection.Hand[],
  keyframes: {
    left: handPoseDetection.Keypoint[][];
    right: handPoseDetection.Keypoint[][];
  }
) => {
  for (let index = 0; index < rawHands.length; index++) {
    //認識されている手の数分ループする（0~2）.
    if (rawHands[index].handedness == "Left") {
      keyframes.left.push(rawHands[index].keypoints);
      if (keyframes.left.length > 5) {
        keyframes.left.shift();
      }
    } else if (rawHands[index].handedness == "Right") {
      keyframes.right.push(rawHands[index].keypoints);
      if (keyframes.right.length > 5) {
        keyframes.right.shift();
      }
    }
  }
  return keyframes;
};
