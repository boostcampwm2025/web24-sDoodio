import type { DodoRoomData } from "../types/dodo-room.types";

export async function fetchSomethingA(roomId: string): Promise<DodoRoomData> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/dodo-rooms/${roomId}`);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as DodoRoomData;
}
