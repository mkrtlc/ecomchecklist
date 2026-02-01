import React from "react";
import { Composition } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { HeroLeakVideo } from "./HeroLeakVideo";

loadInter("normal", {
  subsets: ["latin"],
  weights: ["400", "600", "800"],
  ignoreTooManyRequestsWarning: true,
});

loadJetBrainsMono("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
  ignoreTooManyRequestsWarning: true,
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroLeak16x9"
        component={() => <HeroLeakVideo variant="16x9" />}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeroLeak1x1"
        component={() => <HeroLeakVideo variant="1x1" />}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
