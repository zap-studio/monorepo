"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

// Reduce beams for performance
const MINIMUM_BEAMS = 8;

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 20 + Math.random() * 40, // thinner beams
    length: height * 2, // slightly shorter
    angle,
    speed: 0.3 + Math.random() * 0.5, // slower
    opacity: 0.05 + Math.random() * 0.08, // less visible
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.015, // slower pulse
  };
}

function BeamsBackgroundComponent({
  children,
  className,
  intensity = "strong",
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const currentOpacity = useMemo(() => {
    const opacityMap = {
      subtle: 0.6,
      medium: 0.75,
      strong: 0.9,
    };
    return opacityMap[intensity];
  }, [intensity]);

  const drawBeam = useMemo(
    () => (ctx: CanvasRenderingContext2D, beam: Beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * currentOpacity;

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(
        0.3,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`,
      );
      gradient.addColorStop(
        0.7,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`,
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    },
    [currentOpacity],
  );

  const resetBeam = useMemo(
    () => (beam: Beam, index: number, totalBeams: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const column = index % 3;
      const spacing = canvas.width / 3;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 60 + Math.random() * 40;
      beam.speed = 0.2 + Math.random() * 0.3;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.05 + Math.random() * 0.08;
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(width, height),
      );
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener("resize", handleResize);
    resizeCanvas();

    const FPS = 30;
    const FRAME_INTERVAL = 1000 / FPS;

    const animate = (now: number) => {
      if (now - lastFrameTimeRef.current < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(20px)";

      const totalBeams = beamsRef.current.length;
      for (let i = 0; i < totalBeams; i++) {
        const beam = beamsRef.current[i];
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, i, totalBeams);
        }

        drawBeam(ctx, beam);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [drawBeam, resetBeam]);

  return (
    <div
      className={cn(
        "bg-muted/50 relative h-full w-full dark:bg-neutral-950",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(10px)" }}
      />
      <motion.div
        className="bg-muted/5 absolute inset-0 dark:bg-neutral-950/5"
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ backdropFilter: "blur(30px)" }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export const BeamsBackground = React.memo(BeamsBackgroundComponent);
