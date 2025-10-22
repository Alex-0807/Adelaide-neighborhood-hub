export async function getBookmarks() {
  const res = await fetch("http://localhost:3001/api/bookmarks");
  return res.json();
}

export async function addBookmark(bookmark: {
  userId: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
}) {
  const res = await fetch("http://localhost:3001/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookmark),
  });
  return res.json();
}
