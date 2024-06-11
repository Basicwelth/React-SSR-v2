"use client";

import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";


const initialCache = new Map();
export function Index() {
  const cache = useRef(initialCache);
  let content = cache.current.get("rsc");
  
  if (!content) {
	content = createFromFetch(fetch("/rsc"));
	cache.current.set("rsc", content);
  }
  
  return content;
}

const root = createRoot(document.getElementById("root"));
root.render(<Index />);
