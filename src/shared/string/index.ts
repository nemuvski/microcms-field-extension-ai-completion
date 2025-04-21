/**
 * string型である場合はtrueを返す
 */
const isString = (content: unknown): content is string => {
  return typeof content === "string";
};

/**
 * 文字列が空、または空白のみで構成されている場合はtrueを返す
 */
const isEmptyContent = (content: string): boolean => {
  return /^\s*$/.test(content);
};

/**
 * 補完のトリガーとしては短すぎると判断した場合はtrueを返す
 */
const isTooShortForCompletion = (content: string): boolean => {
  return content.length < 5;
};

/**
 * 文字列から、末尾より指定行数だけ文字列を抽出して返す
 * （各行は trim 済み）
 */
const extractLines = (content: string, numLines = 1): string => {
  if (numLines < 1 || !Number.isSafeInteger(numLines)) {
    throw new RangeError("numLines must be a positive integer");
  }
  return content
    .trim()
    .split(/\r?\n/)
    .slice(-numLines)
    .map((line) => line.trim())
    .join("\n");
};

export { isEmptyContent, isString, isTooShortForCompletion, extractLines };
