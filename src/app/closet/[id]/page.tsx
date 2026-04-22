"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Garment } from "@/types";
import { GarmentDetail } from "@/components/garment/garment-detail";

export default function GarmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [garment, setGarment] = React.useState<Garment | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;

    const fetchGarment = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/garments/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data: Garment = await res.json();
        setGarment(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGarment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-zinc-500 text-sm">Loading garment...</p>
      </div>
    );
  }

  if (notFound || !garment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-white font-medium">Garment not found</p>
        <p className="text-zinc-400 text-sm">
          This garment may have been deleted or does not exist.
        </p>
      </div>
    );
  }

  return <GarmentDetail garment={garment} />;
}
