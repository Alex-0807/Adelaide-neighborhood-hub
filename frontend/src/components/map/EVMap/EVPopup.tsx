import { AuthUser } from "@/hooks/useAuth";
import { Item } from "./types";
import { handlecollection } from "./utils";

export default function EVPopup({
  item,
  goDirection,
  user,
}: {
  item: Item;
  goDirection: () => void;
  user: AuthUser | null;
}) {
  return (
    <div>
      <div>
        <strong>{item.title}</strong>
      </div>
      <div>{item.distanceKm?.toFixed(2)} km away</div>
      <div>{item.address}</div>
      <div>Type: {item.connectionType || "N/A"}</div>
      <div>Power: {item.powerKW ? item.powerKW + " kW" : "N/A"}</div>
      <button
        onClick={goDirection}
        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
      >
        Direction
      </button>
      {user && (
        <button
          onClick={() => handlecollection(item)} //arrow function to pass parameter, without arrow function it will execute immediately
          className="mt-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Collect
        </button>
      )}
    </div>
  );
}
