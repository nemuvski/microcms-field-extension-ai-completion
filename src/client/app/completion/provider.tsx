import type { FC, PropsWithChildren } from "hono/jsx";
import { createContext, useCallback, useContext, useState } from "hono/jsx";
import {
  extractLines,
  isEmptyContent,
  isTooShortForCompletion,
} from "../../../shared/string";
import { TextGenerationKind } from "../../../shared/text-generation";
import { isAbortRequestError } from "./errors";
import {
  useAbortController,
  useSelectWritingMode,
  useToggleSwitch,
} from "./helpers";

type ContextValue = {
  enabled: boolean;
  fetchCompletion: (rawInput: string) => Promise<string | null>;
  resetAbortController: () => void;

  // 以下は、主に内部で利用
  toggleSwitchState: (next?: boolean) => void;
  writingMode: string;
  changeWritingMode: (next: string) => void;
  isRequesting: boolean;
};

const CompletionContext = createContext<ContextValue>({
  enabled: true,
  fetchCompletion: async () => null,
  resetAbortController: () => {},

  toggleSwitchState: () => {},
  writingMode: TextGenerationKind.ORDINARY,
  changeWritingMode: () => {},
  isRequesting: false,
});

const useCompletion = () => {
  const { enabled, fetchCompletion, resetAbortController } =
    useContext(CompletionContext);
  return { enabled, fetchCompletion, resetAbortController };
};

const useCompletionInternal = () => {
  const {
    enabled,
    toggleSwitchState,
    writingMode,
    changeWritingMode,
    isRequesting,
  } = useContext(CompletionContext);
  return {
    enabled,
    toggleSwitchState,
    writingMode,
    changeWritingMode,
    isRequesting,
  };
};

const CompletionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [abortControllerRef, resetAbortController] = useAbortController();
  const [enabled, toggleSwitchState] = useToggleSwitch(resetAbortController);
  const [writingMode, changeWritingMode] =
    useSelectWritingMode(resetAbortController);
  const [isRequesting, setIsRequesting] = useState(false);

  const fetchCompletion = useCallback(
    async (rawInput: string): Promise<string | null> => {
      if (!enabled) {
        return null;
      }

      const reqText = extractLines(rawInput).trim();

      // 文字数が空と判定されたとき、または補完のトリガーとしてはテキストが短すぎると判断した時はスキップ
      if (isEmptyContent(reqText) || isTooShortForCompletion(reqText)) {
        return null;
      }

      setIsRequesting(true);

      let result: string | null = null;

      try {
        const response = await fetch(`/api/v1/completion/${writingMode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({ input: reqText }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json<{
          completion: string;
        }>();

        result = data.completion;
      } catch (error) {
        // 中断されたリクエストのエラーは無視するが、それ以外はエラーログを出力
        if (!isAbortRequestError(error)) {
          console.error("Error fetching completion:", error);
        }
      } finally {
        setIsRequesting(false);
      }

      return result;
    },
    [enabled, writingMode],
  );

  return (
    <CompletionContext.Provider
      value={{
        enabled,
        fetchCompletion,
        resetAbortController,

        toggleSwitchState,
        writingMode,
        changeWritingMode,
        isRequesting,
      }}
    >
      {children}
    </CompletionContext.Provider>
  );
};

export { useCompletion, useCompletionInternal, CompletionProvider };
