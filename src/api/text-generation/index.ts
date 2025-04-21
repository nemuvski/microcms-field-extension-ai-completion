import {
  TextGenerationKind,
  type TextGenerationKindType,
} from "../../shared/text-generation";
import { OrdinaryWritingTextGeneration } from "./ordinary-writing";
import { TechnicalWritingTextGeneration } from "./technical-writing";

const textGenerationFactory = (
  kind: TextGenerationKindType,
  binding: CloudflareBindings["AI"],
  userInput: string,
) => {
  switch (kind) {
    case TextGenerationKind.ORDINARY:
      return new OrdinaryWritingTextGeneration(binding, userInput);
    case TextGenerationKind.TECHNICAL:
      return new TechnicalWritingTextGeneration(binding, userInput);
    default:
      throw new Error(`Unknown text generation kind: ${kind}`);
  }
};

export { textGenerationFactory };
