"use client";
//this component is no longer used
//this component is no longer used
//this component is no longer used
//this component is no longer used
//this component is no longer used
//this component is no longer used
import { useEffect } from "react";
import { getBookmarks } from "@/services/api";
import { get } from "http"; // <-- added this line
import { useState } from "react";
export default function CollectedlistContent() {
  const [bookmarks, sebBookmarks] = useState([]);
  useEffect(() => {
    getBookmarks().then((data) => {
      console.log(data);
      sebBookmarks(data);
    });
  }, []);
  //
  return (
    <div>
      collectedlistContent
      {bookmarks.map((bookmark: any) => (
        <li key={bookmark.id}>
          {bookmark.title} - {bookmark.address}
        </li>
      ))}
    </div>
  );
}
