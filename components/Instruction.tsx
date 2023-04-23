import Image from "next/image";

export const Instruction = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div style={{ display: "inline-block", marginTop: "30vh" }}>
        <Image width={300} height={300} src={"/img/player.svg"} alt="player" />
        <p style={{ color: "white" }}>画面の前に手を出してください。</p>
      </div>
    </div>
  );
};
