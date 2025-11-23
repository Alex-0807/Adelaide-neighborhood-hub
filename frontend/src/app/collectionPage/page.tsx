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
          <p>Welcome, {user.userId}! Here are your collected itemssssssssss.</p>
          <ul>
            {collection.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please log in to view your collection.</p>
      )}
    </div>
  );
}
