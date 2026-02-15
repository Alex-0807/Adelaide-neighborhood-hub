export async function getBookmarks() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookmarks`,
  );
  return res.json();
}

export async function addBookmark(bookmark: {
  userId: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookmarks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookmark),
    },
  );
  return res.json();
}
export async function getVehiclePositions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transit/vehicle-positions`,
  );
  return res.json();
}
