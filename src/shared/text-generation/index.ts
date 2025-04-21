const TextGenerationKind = {
  ORDINARY: "ordinary-writing",
  TECHNICAL: "technical-writing",
} as const;

type TextGenerationKindType =
  (typeof TextGenerationKind)[keyof typeof TextGenerationKind];

const isTextGenerationKind = (
  value: unknown,
): value is TextGenerationKindType => {
  return (
    typeof value === "string" &&
    (value === TextGenerationKind.ORDINARY ||
      value === TextGenerationKind.TECHNICAL)
  );
};

export {
  TextGenerationKind,
  isTextGenerationKind,
  type TextGenerationKindType,
};
