import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

// Industrial robot palette (KUKA-ish)
const RED = "#F5655C";
const PAINT_DARK = "#1a1a1f";
const STEEL = "#2a2d33";
const RUBBER = "#0c0c0e";

/* ---------- Industrial parts ---------- */

// Servo motor housing — short cylinder rotated to sit ALONG the joint axis.
// Default axis = z (matches our hinge joints which rotate around Z).
function JointMotor({
  radius = 0.22,
  width = 0.34,
  axis = "z" as "z" | "y" | "x",
  painted = true,
}: {
  radius?: number;
  width?: number;
  axis?: "z" | "y" | "x";
  painted?: boolean;
}) {
  const rot: [number, number, number] =
    axis === "z"
      ? [Math.PI / 2, 0, 0]
      : axis === "x"
      ? [0, 0, Math.PI / 2]
      : [0, 0, 0];

  return (
    <group rotation={rot}>
      {/* Main motor housing */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 48]} />
        <meshPhysicalMaterial
          color={painted ? RED : PAINT_DARK}
          metalness={painted ? 0.35 : 0.45}
          roughness={painted ? 0.32 : 0.45}
          clearcoat={painted ? 1 : 0.7}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Steel collars */}
      <mesh position={[0, width / 2 + 0.005, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, 0.04, 48]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, -(width / 2 + 0.005), 0]} castShadow>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, 0.04, 48]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.25} />
      </mesh>
      {/* Hub caps */}
      <mesh position={[0, width / 2 + 0.035, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.04, 32]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[0, -(width / 2 + 0.035), 0]} castShadow>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.04, 32]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.18} />
      </mesh>
      {/* Rubber seam */}
      <mesh>
        <torusGeometry args={[radius * 1.005, 0.012, 12, 48]} />
        <meshStandardMaterial color={RUBBER} metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Tapered painted arm link, lays along +X.
function ArmLink({
  length,
  rStart = 0.18,
  rEnd = 0.14,
}: {
  length: number;
  rStart?: number;
  rEnd?: number;
}) {
  return (
    <group>
      <mesh
        position={[length / 2, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[rEnd, rStart, length, 40]} />
        <meshPhysicalMaterial
          color={RED}
          metalness={0.35}
          roughness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Dark machined inset along top */}
      <mesh position={[length / 2, (rStart + rEnd) / 2 * 0.55, 0]}>
        <boxGeometry args={[length * 0.7, 0.022, ((rStart + rEnd) / 2) * 0.55]} />
        <meshPhysicalMaterial
          color={PAINT_DARK}
          metalness={0.4}
          roughness={0.5}
          clearcoat={0.6}
        />
      </mesh>
      {/* Steel end hubs */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[rStart * 1.03, rStart * 1.03, 0.05, 40]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[length, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[rEnd * 1.03, rEnd * 1.03, 0.05, 40]} />
        <meshStandardMaterial color={STEEL} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------- Robotic arm ---------- */

// Shared (module-level) hover flag toggled by the Canvas pointer enter/leave.
const hoverState = { inside: false };

function RoboticArm() {
  const base = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const claw1 = useRef<THREE.Group>(null);
  const claw2 = useRef<THREE.Group>(null);

  // Smoothed pointer (used only when cursor is OUTSIDE the hero).
  const smooth = useRef({ x: 0, y: 0 });

  const SEG1 = 1.5;
  const SEG2 = 1.3;
  const SEG3 = 0.6;

  // Joint limits (radians)
  const LIMITS = {
    baseYaw: [-Math.PI / 2 - 0.2, Math.PI / 2 + 0.2] as const, // ~±100°, full L/R sweep
    shoulder: [-1.2, 1.2] as const,
    elbow: [0.2, 2.5] as const,
    wristZ: [-1.4, 1.4] as const,
    wristX: [-0.6, 0.6] as const,
  };

  const clamp = (v: number, [lo, hi]: readonly [number, number]) =>
    Math.min(hi, Math.max(lo, v));

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const inside = hoverState.inside;

    // --- 1. Pointer input ---
    // INSIDE the hero: snap to cursor (no smoothing) for 1:1 tracking.
    // OUTSIDE: low-pass filter so the arm drifts back gracefully.
    if (inside) {
      smooth.current.x = state.pointer.x;
      smooth.current.y = state.pointer.y;
    } else {
      const k = 1 - Math.exp(-delta * 4);
      smooth.current.x += (state.pointer.x - smooth.current.x) * k;
      smooth.current.y += (state.pointer.y - smooth.current.y) * k;
    }
    const px = clamp(smooth.current.x, [-1, 1]);
    const py = clamp(smooth.current.y, [-1, 1]);

    // Joint lerp factor: instant inside, eased outside.
    const L = inside ? 1 : 0.18;


    // --- 2. Define target in 3D world-ish space relative to shoulder ---
    // Cursor maps to a point on a virtual plane in front of the robot.
    // Forward is +Z (toward camera), X is sideways, Y is up.
    const reach = SEG1 + SEG2; // ignore wrist for IK link lengths
    const tx = px * reach * 0.85;          // sideways
    const ty = py * reach * 0.55;          // vertical (relative to shoulder)
    const tz = 1.4;                        // fixed forward offset (distance from base)

    // --- 3. Base yaw: drive directly from cursor X ---
    // Rest pose of the arm points along local +X (= world right when yaw=0).
    // We want px=0 → arm points toward camera (+Z, yaw = π/2),
    //          px=-1 → arm fully left (yaw → π),
    //          px=+1 → arm fully right (yaw → 0).
    const yawCentered = THREE.MathUtils.clamp(
      Math.PI / 2 - px * Math.PI * 0.55,
      Math.PI / 2 - Math.PI * 0.6,
      Math.PI / 2 + Math.PI * 0.6
    );
    if (base.current) {
      base.current.rotation.y = THREE.MathUtils.lerp(
        base.current.rotation.y,
        yawCentered + (inside ? 0 : Math.sin(t * 0.4) * 0.02),
        L
      );
    }

    // --- 4. 2-link IK in the post-yaw vertical plane ---
    const horiz = Math.hypot(tx, tz);
    const vert = ty;

    const L1 = SEG1;
    const L2 = SEG2;

    const minReach = Math.abs(L1 - L2) + 0.15;
    const maxReach = L1 + L2 - 0.15;
    const dist = THREE.MathUtils.clamp(Math.hypot(horiz, vert), minReach, maxReach);

    const cosElbow = (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2);
    const elbowInner = Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));

    const cosA = (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist);
    const shoulderOffset = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1));

    const aim = Math.atan2(vert, horiz);

    const shoulderTarget = clamp(aim + shoulderOffset, LIMITS.shoulder);
    const elbowTarget = clamp(-(Math.PI - elbowInner), [-2.5, -0.2]);

    if (shoulder.current) {
      shoulder.current.rotation.z = THREE.MathUtils.lerp(
        shoulder.current.rotation.z,
        shoulderTarget,
        L
      );
    }
    if (elbow.current) {
      elbow.current.rotation.z = THREE.MathUtils.lerp(
        elbow.current.rotation.z,
        elbowTarget,
        L
      );
    }
    if (wrist.current) {
      const wristTarget = clamp(
        aim - shoulderTarget - elbowTarget,
        LIMITS.wristZ
      );
      wrist.current.rotation.z = THREE.MathUtils.lerp(
        wrist.current.rotation.z,
        wristTarget,
        L
      );
      wrist.current.rotation.x = THREE.MathUtils.lerp(
        wrist.current.rotation.x,
        clamp(px * 0.25, LIMITS.wristX),
        L

      );
    }

    const grip = (Math.sin(t * 1.4) + 1) * 0.5;
    const open = 0.16 + grip * 0.18;
    if (claw1.current) claw1.current.rotation.z = open;
    if (claw2.current) claw2.current.rotation.z = -open;
  });

  return (
    <group position={[0, -1.3, 0]}>
      {/* ---- Floor plinth (bolted-down base) ---- */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.18, 64]} />
        <meshPhysicalMaterial
          color={PAINT_DARK}
          metalness={0.45}
          roughness={0.5}
          clearcoat={0.6}
        />
      </mesh>
      {/* Bolt heads around plinth */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.86;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.045, Math.sin(a) * r]}
            castShadow
          >
            <cylinderGeometry args={[0.035, 0.035, 0.03, 6]} />
            <meshStandardMaterial color={STEEL} metalness={1} roughness={0.4} />
          </mesh>
        );
      })}

      {/* ---- Rotating base column (J1) ---- */}
      <group ref={base} position={[0, 0.18, 0]}>
        {/* Lower drum */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.72, 0.3, 48]} />
          <meshPhysicalMaterial
            color={RED}
            metalness={0.35}
            roughness={0.32}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Steel ring between drum and yoke */}
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.04, 48]} />
          <meshStandardMaterial color={STEEL} metalness={1} roughness={0.25} />
        </mesh>
        {/* Yoke (twin uprights that hold the shoulder motor) */}
        <mesh position={[0, 0.36, 0.16]} castShadow>
          <boxGeometry args={[0.55, 0.36, 0.12]} />
          <meshPhysicalMaterial
            color={RED}
            metalness={0.35}
            roughness={0.32}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        <mesh position={[0, 0.36, -0.16]} castShadow>
          <boxGeometry args={[0.55, 0.36, 0.12]} />
          <meshPhysicalMaterial
            color={RED}
            metalness={0.35}
            roughness={0.32}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>

        {/* ---- Shoulder motor (J2) ---- */}
        <group position={[0, 0.5, 0]}>
          <JointMotor radius={0.3} width={0.5} axis="z" painted={false} />

          <group ref={shoulder}>
            {/* Upper arm */}
            <ArmLink length={SEG1} rStart={0.22} rEnd={0.16} />

            {/* ---- Elbow motor (J3) ---- */}
            <group position={[SEG1, 0, 0]}>
              <JointMotor radius={0.22} width={0.4} axis="z" painted={false} />

              <group ref={elbow}>
                {/* Forearm */}
                <ArmLink length={SEG2} rStart={0.16} rEnd={0.12} />

                {/* ---- Wrist assembly (J4 + J5) ---- */}
                <group position={[SEG2, 0, 0]}>
                  <JointMotor radius={0.16} width={0.32} axis="z" painted={false} />

                  <group ref={wrist}>
                    {/* Wrist link (dark housing) */}
                    <mesh
                      position={[SEG3 / 2, 0, 0]}
                      rotation={[0, 0, -Math.PI / 2]}
                      castShadow
                      receiveShadow
                    >
                      <cylinderGeometry args={[0.1, 0.13, SEG3, 32]} />
                      <meshPhysicalMaterial
                        color={PAINT_DARK}
                        metalness={0.4}
                        roughness={0.45}
                        clearcoat={0.7}
                      />
                    </mesh>

                    {/* J5 cross-axis motor (axis along X — looks like a real wrist) */}
                    <group position={[SEG3, 0, 0]}>
                      <JointMotor radius={0.13} width={0.26} axis="x" painted />

                      {/* ---- Tool flange + gripper ---- */}
                      <group position={[0.18, 0, 0]}>
                        {/* ISO tool flange */}
                        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                          <cylinderGeometry args={[0.11, 0.11, 0.04, 32]} />
                          <meshStandardMaterial
                            color={STEEL}
                            metalness={1}
                            roughness={0.25}
                          />
                        </mesh>
                        {/* Gripper body */}
                        <mesh position={[0.09, 0, 0]} castShadow>
                          <boxGeometry args={[0.18, 0.26, 0.26]} />
                          <meshPhysicalMaterial
                            color={PAINT_DARK}
                            metalness={0.4}
                            roughness={0.45}
                            clearcoat={0.7}
                          />
                        </mesh>
                        {/* Status LED */}
                        <mesh position={[0.09, 0.11, 0.11]}>
                          <sphereGeometry args={[0.018, 16, 16]} />
                          <meshStandardMaterial
                            color={RED}
                            emissive={RED}
                            emissiveIntensity={5}
                            toneMapped={false}
                          />
                        </mesh>

                        {/* Two-finger parallel gripper */}
                        <group ref={claw1} position={[0.18, 0.1, 0]}>
                          {/* Knuckle */}
                          <mesh castShadow>
                            <boxGeometry args={[0.05, 0.06, 0.18]} />
                            <meshStandardMaterial
                              color={STEEL}
                              metalness={1}
                              roughness={0.3}
                            />
                          </mesh>
                          {/* Finger */}
                          <mesh position={[0.16, -0.02, 0]} castShadow>
                            <boxGeometry args={[0.32, 0.05, 0.16]} />
                            <meshPhysicalMaterial
                              color={RED}
                              metalness={0.35}
                              roughness={0.32}
                              clearcoat={1}
                              clearcoatRoughness={0.08}
                            />
                          </mesh>
                          {/* Rubber pad */}
                          <mesh position={[0.3, -0.05, 0]} castShadow>
                            <boxGeometry args={[0.04, 0.02, 0.14]} />
                            <meshStandardMaterial
                              color={RUBBER}
                              metalness={0.05}
                              roughness={0.95}
                            />
                          </mesh>
                        </group>
                        <group ref={claw2} position={[0.18, -0.1, 0]}>
                          <mesh castShadow>
                            <boxGeometry args={[0.05, 0.06, 0.18]} />
                            <meshStandardMaterial
                              color={STEEL}
                              metalness={1}
                              roughness={0.3}
                            />
                          </mesh>
                          <mesh position={[0.16, 0.02, 0]} castShadow>
                            <boxGeometry args={[0.32, 0.05, 0.16]} />
                            <meshPhysicalMaterial
                              color={RED}
                              metalness={0.35}
                              roughness={0.32}
                              clearcoat={1}
                              clearcoatRoughness={0.08}
                            />
                          </mesh>
                          <mesh position={[0.3, 0.05, 0]} castShadow>
                            <boxGeometry args={[0.04, 0.02, 0.14]} />
                            <meshStandardMaterial
                              color={RUBBER}
                              metalness={0.05}
                              roughness={0.95}
                            />
                          </mesh>
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ---------- Scene ---------- */

export default function Hero3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 7], fov: 32 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onPointerEnter={() => {
        hoverState.inside = true;
      }}
      onPointerLeave={() => {
        hoverState.inside = false;
      }}
    >
      {/* Three-point studio lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      {/* Rim light (cool) */}
      <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#7aa9ff" />
      {/* Accent fill */}
      <pointLight position={[0, 1.5, 2.5]} intensity={0.6} color={RED} />

      <Suspense fallback={null}>
        <RoboticArm />

        <ContactShadows
          position={[0, -1.32, 0]}
          opacity={0.6}
          scale={10}
          blur={2.4}
          far={3}
          resolution={1024}
          color="#000000"
        />

        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
