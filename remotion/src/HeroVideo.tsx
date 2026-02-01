import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
  AbsoluteFill,
  spring,
} from "remotion";

const GREEN = "#22c55e";
const DARK_GREEN = "#16a34a";
const BG_GRADIENT = "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ffffff 100%)";

// Animated checkmark component
const AnimatedCheckmark: React.FC<{
  delay: number;
  x: number;
  y: number;
  size?: number;
}> = ({ delay, x, y, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const scale = interpolate(progress, [0, 1], [0, 1]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={GREEN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" fill="#dcfce7" stroke={GREEN} />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{
  delay: number;
  x: number;
  y: number;
  width: number;
  label: string;
  targetPercent: number;
  color?: string;
}> = ({ delay, x, y, width, label, targetPercent, color = GREEN }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fillProgress = interpolate(frame - delay - 10, [0, 45], [0, targetPercent], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 8,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width,
          height: 12,
          backgroundColor: "#e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fillProgress}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 6,
            transition: "width 0.1s ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#6b7280",
          marginTop: 4,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {Math.round(fillProgress)}%
      </div>
    </div>
  );
};

// Icon card component
const IconCard: React.FC<{
  delay: number;
  x: number;
  y: number;
  icon: string;
  label: string;
}> = ({ delay, x, y, icon, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateY = interpolate(slideUp, [0, 1], [50, 0]);
  const opacity = interpolate(slideUp, [0, 1], [0, 1]);

  // Floating animation
  const floatY = Math.sin((frame - delay) * 0.05) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + translateY + (opacity > 0.5 ? floatY : 0),
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 20,
          backgroundColor: "white",
          boxShadow: "0 10px 40px rgba(34, 197, 94, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(icon)}
          style={{
            width: 70,
            height: 70,
            objectFit: "contain",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#374151",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Score circle component
const ScoreCircle: React.FC<{
  delay: number;
  score: number;
}> = ({ delay, score }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scoreProgress = interpolate(frame - delay - 20, [0, 60], [0, score], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (scoreProgress / 100) * circumference;

  // Pulsing effect
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  return (
    <div
      style={{
        position: "absolute",
        right: 200,
        top: "50%",
        transform: `translateY(-50%) scale(${fadeIn * pulse})`,
        opacity: fadeIn,
      }}
    >
      <svg width="240" height="240" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={GREEN}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 100 100)"
          style={{
            filter: "drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))",
          }}
        />
        {/* Score text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fontSize="56"
          fontWeight="bold"
          fill="#1f2937"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {Math.round(scoreProgress)}
        </text>
        <text
          x="100"
          y="120"
          textAnchor="middle"
          fontSize="18"
          fill="#6b7280"
          fontFamily="Inter, system-ui, sans-serif"
        >
          Store Score
        </text>
      </svg>
    </div>
  );
};

// Main title component
const MainTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const opacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const translateY = interpolate(titleSpring, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 100,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#dcfce7",
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            color: GREEN,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          ✓ E-commerce Audit
        </div>
      </div>
      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#1f2937",
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.1,
        }}
      >
        Is Your Store
        <br />
        <span style={{ color: GREEN }}>Ready to Convert?</span>
      </h1>
    </div>
  );
};

// Floating particles
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  
  const particles = [
    { x: 100, y: 200, size: 8, speed: 0.02 },
    { x: 300, y: 600, size: 6, speed: 0.03 },
    { x: 1600, y: 300, size: 10, speed: 0.025 },
    { x: 1400, y: 700, size: 7, speed: 0.02 },
    { x: 800, y: 100, size: 5, speed: 0.035 },
    { x: 1100, y: 800, size: 9, speed: 0.015 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y + Math.sin(frame * p.speed + i) * 30,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: GREEN,
            opacity: 0.2,
          }}
        />
      ))}
    </>
  );
};

export const HeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENT,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Floating particles */}
      <Particles />

      {/* Main title */}
      <MainTitle />

      {/* Icon cards */}
      <IconCard delay={30} x={100} y={400} icon="seo-icon.webp" label="SEO" />
      <IconCard delay={45} x={240} y={400} icon="performance-icon.webp" label="Speed" />
      <IconCard delay={60} x={380} y={400} icon="security-icon.webp" label="Security" />
      <IconCard delay={75} x={520} y={400} icon="conversion-icon.webp" label="Conversion" />

      {/* Progress bars */}
      <ProgressBar
        delay={90}
        x={100}
        y={620}
        width={280}
        label="Performance Score"
        targetPercent={87}
      />
      <ProgressBar
        delay={105}
        x={100}
        y={720}
        width={280}
        label="SEO Health"
        targetPercent={92}
        color={DARK_GREEN}
      />
      <ProgressBar
        delay={120}
        x={100}
        y={820}
        width={280}
        label="Security Rating"
        targetPercent={95}
      />

      {/* Animated checkmarks */}
      <AnimatedCheckmark delay={150} x={450} y={630} />
      <AnimatedCheckmark delay={165} x={450} y={730} />
      <AnimatedCheckmark delay={180} x={450} y={830} />

      {/* Score circle */}
      <ScoreCircle delay={60} score={91} />

      {/* Checklist items appearing */}
      {[
        { text: "Product pages optimized", delay: 200 },
        { text: "Mobile responsive ✓", delay: 220 },
        { text: "SSL secured", delay: 240 },
        { text: "Fast checkout flow", delay: 260 },
      ].map((item, i) => {
        const itemOpacity = interpolate(frame - item.delay, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const itemX = interpolate(frame - item.delay, [0, 15], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 120,
              top: 420 + i * 50,
              opacity: itemOpacity,
              transform: `translateX(${itemX}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "white",
              padding: "12px 20px",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={GREEN}
              strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#374151",
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
