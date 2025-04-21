import { useCallback, useRef, useState } from "hono/jsx";
import {
  TextGenerationKind,
  type TextGenerationKindType,
  isTextGenerationKind,
} from "../../../shared/text-generation";
import { AbortRequestError } from "./errors";

const useAbortController = () => {
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const resetAbortController = useCallback(() => {
    abortControllerRef.current?.abort(new AbortRequestError());
    abortControllerRef.current = new AbortController();
  }, []);

  return [abortControllerRef, resetAbortController] as const;
};

const useToggleSwitch = (resetAbortController: () => void) => {
  const [enabled, setEnabled] = useState(true);

  const toggleSwitch = useCallback(
    (next?: boolean) => {
      if (next === undefined) {
        setEnabled((prev) => !prev);
      } else {
        setEnabled(next);
      }
      // 切り替わるタイミングでAbortControllerをリセットする
      resetAbortController();
    },
    [resetAbortController],
  );

  return [enabled, toggleSwitch] as const;
};

const useSelectWritingMode = (resetAbortController: () => void) => {
  const [selectedMode, setSelectedMode] = useState<TextGenerationKindType>(
    TextGenerationKind.ORDINARY,
  );

  const changeMode = useCallback(
    (next: TextGenerationKindType | string) => {
      if (isTextGenerationKind(next)) {
        setSelectedMode(next);
        // 切り替わるタイミングでAbortControllerをリセットする
        resetAbortController();
      }
    },
    [resetAbortController],
  );

  return [selectedMode, changeMode] as const;
};

export { useAbortController, useToggleSwitch, useSelectWritingMode };
