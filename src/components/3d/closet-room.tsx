"use client";

import * as React from "react";

export function ClosetRoom() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.5, -2]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#141414" roughness={0.8} />
      </mesh>

      {/* Hanging rack bar */}
      <mesh position={[0, 2.5, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 5, 12]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left rack support */}
      <mesh position={[-2.4, 1.5, -1.5]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 12]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Right rack support */}
      <mesh position={[2.4, 1.5, -1.5]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2, 12]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shoe shelf */}
      <mesh position={[0, -0.3, -1.5]} receiveShadow>
        <boxGeometry args={[4, 0.05, 0.6]} />
        <meshStandardMaterial color="#27272a" roughness={0.7} />
      </mesh>
    </group>
  );
}
