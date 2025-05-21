"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[10rem] w-full items-center justify-center overflow-hidden">
      <MaskContainer
        revealText={
          <p className="mx-auto w-full text-center text-2xl font-bold text-slate-800 dark:text-white">
            Confused about your Tech future? PathAI builds your AI powered roadmap, guiding you stepwise towrads your dream.
          </p>
        }
        className="h-[40rem] rounded-md border text-white dark:text-black"
      >
       Creates <span className=" text-purple-400">personized roadmaps</span> with{" "}
        <span className="text-purple-400"> smart recommendations</span> 
        <span> and with </span>
        <span className="text-purple-400"> real-time data</span>.
      </MaskContainer>
    </div>
  );
}
