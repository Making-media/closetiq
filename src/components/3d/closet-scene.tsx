"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Garment, GarmentType } from "@/types";
import { ClosetRoom } from "./closet-room";
import { GarmentModel } from "./garment-model";

interface ClosetSceneProps {
  garments: Garment[];
  onGarmentClick?: (garment: Garment) => void;
}

interface ArrangedGarment {
  garment: Garment;
  position: [number, number, number];
}

function arrangeGarments(garments: Garment[]): ArrangedGarment[] {
  const buckets: Record<string, Garment[]> = {
    tops: [],
    dresses: [],
    bottoms: [],
    shoes: [],
    accessories: [],
  };

  for (const g of garments) {
    switch (g.type as GarmentType) {
      case "shirt":
      case "jacket":
      case "outerwear":
        buckets.tops.push(g);
        break;
      case "dress":
      case "skirt":
        buckets.dresses.push(g);
        break;
      case "pants":
      case "shorts":
        buckets.bottoms.push(g);
        break;
      case "shoes":
        buckets.shoes.push(g);
        break;
      default:
        buckets.accessories.push(g);
    }
  }

  const arranged: ArrangedGarment[] = [];

  buckets.tops.forEach((g, i) => {
    arranged.push({ garment: g, position: [-1.5 + i * 0.9, 2, -1.5] });
  });

  buckets.dresses.forEach((g, i) => {
    arranged.push({ garment: g, position: [-1.5 + i * 0.9, 1.8, -1.4] });
  });

  buckets.bottoms.forEach((g, i) => {
    arranged.push({ garment: g, position: [-1.5 + i * 0.9, 0.5, -1.2] });
  });

  buckets.shoes.forEach((g, i) => {
    arranged.push({ garment: g, position: [-1.2 + i * 0.8, -0.1, -1.2] });
  });

  buckets.accessories.forEach((g, i) => {
    arranged.push({ garment: g, position: [2.5, 1.5 - i * 0.7, -1.3] });
  });

  return arranged;
}

export function ClosetScene({ garments, onGarmentClick }: ClosetSceneProps) {
  const arranged = arrangeGarments(garments);

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: "600px" }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 3, 2]} intensity={0.6} color="#e0e0ff" />

        <React.Suspense fallback={null}>
          <Environment preset="studio" />
          <ClosetRoom />
          {arranged.map(({ garment, position }) => (
            <GarmentModel
              key={garment.id}
              garment={garment}
              position={position}
              onClick={onGarmentClick}
            />
          ))}
        </React.Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
