"use client";

import { useEffect, useRef } from "react";

const VERT_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_mouse.x / u_res.y, u_mouse.y / u_res.y);

  float t = u_time * 0.06;

  // Domain-warped flow field: slow drifting silk.
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(t, -t * 0.7)),
    fbm(p * 1.4 + vec2(5.2 - t, 1.3 + t))
  );

  // Cursor stirs the field and adds a soft light.
  float md = length(p - m);
  float glow = exp(-md * md * 3.5) * u_hover;

  vec2 r = vec2(
    fbm(p * 1.6 + q * 1.8 + vec2(1.7, 9.2) + t * 0.6 + glow * 0.9),
    fbm(p * 1.6 + q * 1.8 + vec2(8.3, 2.8) - t * 0.5 - glow * 0.7)
  );
  float f = fbm(p * 1.6 + r * 2.0);

  // Whisper-soft diagonal bars riding the flow.
  float bars = sin((p.x * 0.9 + p.y * 0.45 + r.x * 2.2) * 3.14159) * 0.5 + 0.5;

  vec3 indigo = vec3(0.31, 0.27, 0.90);
  vec3 sky = vec3(0.22, 0.74, 0.97);
  vec3 violet = vec3(0.65, 0.54, 0.98);

  float band1 = smoothstep(0.25, 0.85, f);
  float band2 = smoothstep(0.35, 0.90, r.y);
  float band3 = smoothstep(0.30, 0.95, q.x);

  vec3 col = vec3(1.0);
  col = mix(col, mix(vec3(0.965, 0.965, 1.0), indigo, 0.55), band1 * 0.30);
  col = mix(col, sky, band2 * 0.14 + bars * 0.03 * band2);
  col = mix(col, violet, band3 * 0.12);

  // Cursor light: gentle lift tinted toward indigo.
  col += glow * vec3(0.10, 0.08, 0.16);
  col = mix(col, indigo, glow * 0.10);

  // Dither to avoid banding on near-white.
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[hero-shader]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Full-bleed interactive light-field behind the hero copy.
 * Brand indigo/sky silk on white; the cursor stirs the flow and leaves
 * a soft light. Pure WebGL, no dependencies. Renders nothing if WebGL
 * is unavailable (the CSS gradient washes remain as the backdrop).
 */
export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[hero-shader]", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Fullscreen triangle strip.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uHover = gl.getUniformLocation(program, "u_hover");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return dpr;
    };
    let dpr = resize();

    // Cursor state in CSS px relative to the canvas; smoothed each frame.
    const target = { x: 0, y: 0, hover: 0 };
    const smooth = { x: 0, y: 0, hover: 0 };
    let hasPointer = false;

    const section = canvas.closest("section");

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = rect.height - (e.clientY - rect.top); // flip to GL space
      target.hover = 1;
      hasPointer = true;
    };
    const onLeave = () => {
      target.hover = 0;
    };
    section?.addEventListener("pointermove", onMove);
    section?.addEventListener("pointerleave", onLeave);

    const draw = (time: number) => {
      resize();
      const k = 0.08;
      smooth.x += (target.x - smooth.x) * k;
      smooth.y += (target.y - smooth.y) * k;
      smooth.hover += (target.hover - smooth.hover) * 0.05;

      // Seed the light at the hero's left-center until first pointer contact.
      const mx = hasPointer ? smooth.x : canvas.clientWidth * 0.25;
      const my = hasPointer ? smooth.y : canvas.clientHeight * 0.45;
      const hover = hasPointer ? smooth.hover : 0.35;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mx * dpr, my * dpr);
      gl.uniform1f(uHover, hover);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    if (reducedMotion) {
      draw(0);
    } else {
      const loop = (now: number) => {
        if (visible) draw((now - t0) / 1000);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const ro = new ResizeObserver(() => {
      dpr = resize();
      if (reducedMotion) draw(0);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
