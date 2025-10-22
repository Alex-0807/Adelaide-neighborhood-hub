import { createRoot, Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import React from "react";

export function mountReactPopup(
  element: React.ReactElement,
  popupOpts: maplibregl.PopupOptions = { closeOnClick: false }
) {
  const node = document.createElement("div");
  const root: Root = createRoot(node);
  root.render(element);
  const popup = new maplibregl.Popup(popupOpts).setDOMContent(node);
  const destroy = () => root.unmount(); // remember to unmount the React component when destroying the popup
  return { popup, destroy };
}
