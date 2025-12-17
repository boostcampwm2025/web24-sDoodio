export async function fetchData(): Promise<string[]> {
  const response = await fetch('/data');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as string[];
}
