"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface CollectionItem {
  id: number;
  title: string;
  address: string | null;
  lat: number;
  lng: number;
  postId: number;
}

async function getUserCollection(userId: number) {
  const res = await fetch(`http://localhost:3001/favourite`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data.items || [];
}

export default function CollectionPage() {
  const { user } = useAuth();
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  async function loadCollection() {
    console.log("Loading collection for user:", user!.userId);

    const data = await getUserCollection(user!.userId);
    setCollection(data);
    console.log("Loaded collection:", data);
  }
  async function handleDelete(itemId: number) {
    console.log("Deleting item from collection:", itemId);

    const res = await fetch(`http://localhost:3001/favourite/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCollection((prev) => prev.filter((item) => item.id !== itemId));
      alert("Item deleted from collection");
    } else {
      console.error("Failed to delete item from collection");
    }
  }
  useEffect(() => {
    console.log("user changed:", user);

    if (user) {
      loadCollection();
    }
  }, [user]);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Collection</h1>
      {user ? (
        <div>
          <p className="mb-4 text-gray-700">
            Welcome, {user.userId}! Here are your collected items.
          </p>
          <ul className="space-y-3">
            {collection.map((item) => (
              <li
                key={item.id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-lg">{item.title}</p>
                  {item.address && (
                    <p className="text-sm text-gray-500">{item.address}</p>
                  )}
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-200 transition"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please log in to view your collection.</p>
      )}
    </div>
  );
}
