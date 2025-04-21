import { render } from "hono/jsx/dom";
import App from "./app";

const root = document.getElementById("app");
if (!root) {
  throw new Error("#app element not found");
}

render(<App />, root);
