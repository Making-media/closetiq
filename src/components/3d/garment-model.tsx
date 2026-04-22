"use client";

import * as React from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Garment } from "@/types";

interface GarmentModelProps {
  garment: Garment;
  position: [number, number, number];
  onClick?: (garment: Garment) => void;
}

function getGeometry(type: Garment["type"]) {
  switch (type) {
    case "shirt":
    case "jacket":
    case "outerwear":
      return { shape: "box" as const, args: [0.6, 0.7, 0.15] as [number, number, number] };
    case "pants":
    case "shorts":
      return { shape: "box" as const, args: [0.5, 0.8, 0.12] as [number, number, number] };
    case "dress":
    case "skirt":
      return { shape: "cylinder" as const, args: [0.2, 0.35, 0.8, 16] as [number, number, number, number] };
    case "shoes":
      return { shape: "box" as const, args: [0.35, 0.2, 0.6] as [number, number, number] };
    default:
      return { shape: "sphere" as const, args: [0.25, 16, 16] as [number, number, number] };
  }
}

export function GarmentModel({ garment, position, onClick }: GarmentModelProps) {
  const [hovered, setHovered] = React.useState(false);
  const geo = getGeometry(garment.type);
  const colorHex = garment.colors[0]?.hex ?? "#888888";

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.(garment);
  };

  return (
    <group position={position}>
      <mesh
        scale={hovered ? 1.1 : 1}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {geo.shape === "box" && <boxGeometry args={geo.args as [number, number, number]} />}
        {geo.shape === "cylinder" && <cylinderGeometry args={geo.args as [number, number, number, number]} />}
        {geo.shape === "sphere" && <sphereGeometry args={geo.args as [number, number, number]} />}
        <meshStandardMaterial
          color={colorHex}
          emissive={hovered ? colorHex : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color="#a1a1aa"
        anchorX="center"
        anchorY="top"
        maxWidth={1.2}
      >
        {garment.name}
      </Text>
    </group>
  );
}
