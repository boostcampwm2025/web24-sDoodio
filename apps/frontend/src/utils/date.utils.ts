function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function getLocalDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}
