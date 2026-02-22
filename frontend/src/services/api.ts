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
export async function getVehiclePositions(lat?: number, lng?: number) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transit/vehicle-positions`,
  );
  if (lat && lng) {
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lng", lng.toString());
  }
  const res = await fetch(url.toString());
  return res.json();
}
