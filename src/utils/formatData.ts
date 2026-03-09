export function formatData(dateString: string | number | Date): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDataWithHours(
  dateString: string | number | Date
): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
export function parseDateString(dateString: string): Date {
  const [datePart, timePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
  return new Date(year, month - 1, day);
}

export function toSaveFormat(date: Date): string {
  return date.toISOString();
}
