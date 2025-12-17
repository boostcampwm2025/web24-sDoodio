import { useEffect, useState } from "react";

import { fetchSomethingA } from "../apis/fetchSomethingA.api";
import type { DodoRoomData } from "../types/dodo-room.types";

type UseDodoRoomResult = {
  room: DodoRoomData | null;
  error: string | null;
  loading: boolean;
};

export function useHook(roomId: string): UseDodoRoomResult {
  const [room, setRoom] = useState<DodoRoomData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSomethingA(roomId)
      .then((data) => {
        if (!cancelled) setRoom(data);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return { room, error, loading };
}
