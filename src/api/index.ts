import { Hono } from "hono";
import { extractLines, isString, shouldComplete } from "../shared/string";
import { isTextGenerationKind } from "../shared/text-generation";
import { textGenerationFactory } from "./text-generation";

const route = new Hono<{ Bindings: CloudflareBindings }>().basePath("/api/v1");

route.post("/completion/:kind", async (c) => {
  const pathParamKind = c.req.param("kind");

  if (!isTextGenerationKind(pathParamKind)) {
    return c.notFound();
  }

  const { input } = await c.req.json<{
    input: string;
  }>();

  if (!isString(input)) {
    return c.json({ error: "input value should be string" }, 400);
  }

  const normalizedInput = extractLines(input);

  if (!shouldComplete(normalizedInput)) {
    return c.json({ completion: "" });
  }

  let text = "";
  try {
    const textGeneration = textGenerationFactory(
      pathParamKind,
      c.env.AI,
      normalizedInput,
    );
    text = await textGeneration.request();
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to generate completion" }, 500);
  }

  return c.json({ completion: text });
});

export default route;
