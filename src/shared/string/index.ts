/**
 * string型である場合はtrueを返す
 */
const isString = (content: unknown): content is string => {
  return typeof content === "string";
};

/**
 * 文字列が空、または空白のみで構成されている場合はtrueを返す正規表現
 * 例: " ", "\t", "\n", "\r\n" など
 */
const regexpBlankOnly = /^\s*$/;

/**
 * 文字列が空、または空白のみで構成されている場合はtrueを返す
 */
const isEmptyContent = (content: string): boolean => {
  return regexpBlankOnly.test(content);
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

/**
 * 文字列の末尾に、句点や感嘆符などの終止符があるかを判定する
 */
const regexpPeriod = /[。．.！？!?]$/;

/**
 * 補完を行うべきかを判定する
 * 1. 空文字列でないこと
 * 2. 補完のトリガーとしては短すぎないこと
 * 3. 末尾に句点や感嘆符などの終止符がないこと
 * 以上の条件を満たす場合はtrueを返す
 */
const shouldComplete = (content: string) => {
  return !(
    isEmptyContent(content) ||
    isTooShortForCompletion(content) ||
    regexpPeriod.test(content)
  );
};

export { isEmptyContent, isString, extractLines, shouldComplete };
