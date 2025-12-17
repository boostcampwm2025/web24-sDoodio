import { useHook } from "../hooks/useHook";

export function DodoRoom() {
  const { room, error, loading } = useHook("demo");

  let content = <p className="mt-2 text-sm text-zinc-400">No data</p>;
  if (loading) content = <p className="mt-2 text-sm text-zinc-400">Loading…</p>;
  if (room) {
    content = (
      <p className="mt-2 text-sm text-zinc-300">
        Loaded: {room.id} / {room.name}
      </p>
    );
  }
  if (error) content = <p className="mt-2 text-sm text-red-300">{error}</p>;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-base font-semibold">DodoRoom</h2>
      {content}
    </section>
  );
}
