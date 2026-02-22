import { Item } from "./types";

export function goDirection(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
}

export async function handlecollection(item: Item) {
  console.log("handle collection started");
  console.log("Item to collect:", item);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/favourite`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: item.title,
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          postId: item.id, // Ensure postId is sent
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to add favourite:", data);
      alert(`Failed to add favourite: ${data.error || "Unknown error"}`);
    } else {
      console.log("favourite added:", data);
      alert("Added to favourites!");
    }
  } catch (error) {
    console.log("Error adding favourites:", error);
    alert("Network error while adding favourite");
  }
}
