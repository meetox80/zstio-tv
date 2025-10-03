import { FC } from "react";

const Background: FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full opacity-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -bottom-72 -left-72 rounded-full bg-red-900/10 blur-[120px]"></div>
        <div className="absolute w-[500px] h-[500px] -top-64 -right-64 rounded-full bg-red-800/5 blur-[100px]"></div>
        <span className="absolute w-[1px] h-32 bg-gradient-to-b from-red-800/30 to-transparent top-0 left-[33%] animate-[glow_4s_ease-in-out_infinite]"></span>
        <span className="absolute w-[1px] h-24 bg-gradient-to-b from-red-800/20 to-transparent top-0 left-[66%] animate-[glow_6s_ease-in-out_infinite_1.5s]"></span>
      </div>
    </div>
  );
};

export default Background;
