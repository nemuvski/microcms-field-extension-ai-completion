import { type FC, useCallback, useEffect, useRef } from "hono/jsx";
import { isEmptyContent, isString } from "../../shared/string";
import { useCompletion } from "./completion";
import type { useMicroCMSFieldExtension } from "./microcms-field-extension";

type Props = {
  defaultValue: string;
  sendMessageToMicroCMS: ReturnType<typeof useMicroCMSFieldExtension>[2];
};

const Editor: FC<Props> = ({ defaultValue, sendMessageToMicroCMS }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const completionTextRef = useRef<HTMLElement | null>(null);
  const isInternalSelectionChange = useRef<boolean>(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { enabled, fetchCompletion, resetAbortController } = useCompletion();

  // 初期値を設定する
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = defaultValue;
    }
  }, [defaultValue]);

  const getCurrentCaretInfo = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    return {
      selection,
      range,
    };
  }, []);

  const removeCompletionText = useCallback(() => {
    if (
      !isInternalSelectionChange.current && // 内部での変更によるものでない場合に限る
      editorRef.current &&
      completionTextRef.current
    ) {
      // i要素を取得し、すべて削除する
      const completionTextNodes = editorRef.current.querySelectorAll("i");
      for (const node of completionTextNodes) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
      completionTextRef.current = null;
      editorRef.current.normalize();
    }
  }, []);

  const completion = useCallback(
    async (rawText: string) => {
      if (!enabled || !editorRef.current) {
        return;
      }

      const preCaretInfo = getCurrentCaretInfo();
      if (!preCaretInfo) {
        return;
      }

      // 補完内容を取得
      const response = await fetchCompletion(rawText);
      if (!isString(response) || !response) {
        return;
      }

      // 事前に取得したカーソル位置と比較して、変わっていれば中断する
      // これは、補完内容を取得しているときに、カーソル位置が変わってしまうことを防ぐため
      const postCaretInfo = getCurrentCaretInfo();
      if (
        !postCaretInfo ||
        preCaretInfo.range.startContainer !==
          postCaretInfo.range.startContainer ||
        preCaretInfo.range.startOffset !== postCaretInfo.range.startOffset
      ) {
        return;
      }

      // 補完内容を挿入する
      isInternalSelectionChange.current = true;
      completionTextRef.current = document.createElement("i");
      completionTextRef.current.setAttribute("aria-live", "polite");
      completionTextRef.current.className = "completion-text";
      completionTextRef.current.textContent = response;
      preCaretInfo.range.insertNode(completionTextRef.current);

      // 補完内容を挿入したときに、選択状態になるため、選択解除とキャレットの移動
      preCaretInfo.range.setStartBefore(completionTextRef.current);
      preCaretInfo.range.collapse(true);
      preCaretInfo.selection.removeAllRanges();
      preCaretInfo.selection.addRange(preCaretInfo.range);

      // 上記のノード挿入後に、selectionchangeイベントが発火してしまう
      // イベントキューの都合で一拍おいてからオフにする
      // requestAnimationFrameを使うと、次の描画フレームで実行しても良いが不安定なので不採用
      setTimeout(() => {
        isInternalSelectionChange.current = false;
      }, 0);
    },
    [enabled, fetchCompletion, getCurrentCaretInfo],
  );

  const setDebounceTimeout = useCallback(
    (text: string) => {
      debounceTimeout.current = setTimeout(() => completion(text), 750);
    },
    [completion],
  );

  const resetDebounceTimeout = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  }, []);

  const triggerCompletionByInputEvent = useCallback(() => {
    if (!editorRef.current) {
      return;
    }

    // カーソル位置より前の文字列で補完を行う
    // ただし、カーソル位置が取得できない場合は、中断する
    const currentCaretInfo = getCurrentCaretInfo();
    if (!currentCaretInfo) {
      resetDebounceTimeout();
      return;
    }
    const preCaretRange = currentCaretInfo.range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(
      currentCaretInfo.range.startContainer,
      currentCaretInfo.range.startOffset,
    );
    const textBeforeCaret = preCaretRange.toString();

    if (isEmptyContent(textBeforeCaret)) {
      resetDebounceTimeout();
      return;
    }

    // 入力のたびにリセットする
    if (debounceTimeout.current) {
      resetDebounceTimeout();
      resetAbortController();
    }

    // 入力が終わってから、時間が経つとAPIを呼び出す
    setDebounceTimeout(textBeforeCaret);
  }, [getCurrentCaretInfo, resetAbortController, resetDebounceTimeout]);

  const handleInput = useCallback(
    async (e: InputEvent) => {
      if (!editorRef.current) {
        return;
      }

      if (!e.isComposing) {
        sendMessageToMicroCMS({ data: editorRef.current.innerText });
      }

      // 補完が有効なときに、IMEの変換中、削除やペースト以外のイベントでは、補完処理をトリガーする
      if (enabled && e.inputType === "insertText") {
        triggerCompletionByInputEvent();
      } else {
        resetDebounceTimeout();
      }
    },
    [
      enabled,
      resetDebounceTimeout,
      sendMessageToMicroCMS,
      triggerCompletionByInputEvent,
    ],
  );

  const handleCompositionEnd = useCallback(
    (_e: CompositionEvent) => {
      if (!editorRef.current) {
        return;
      }
      sendMessageToMicroCMS({ data: editorRef.current.innerText });

      if (enabled) {
        triggerCompletionByInputEvent();
      }
    },
    [enabled, sendMessageToMicroCMS, triggerCompletionByInputEvent],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (!editorRef.current) {
          return;
        }

        const currentCaretInfo = getCurrentCaretInfo();
        if (!currentCaretInfo) {
          return;
        }

        if (completionTextRef.current?.textContent) {
          // ゴーストテキストがあるときにタブキーを押したら、確定する
          const textNode = document.createTextNode(
            completionTextRef.current.textContent,
          );
          currentCaretInfo.range.insertNode(textNode);
          // カーソルをテキストのあとに移動
          currentCaretInfo.range.setStartAfter(textNode);
          currentCaretInfo.range.collapse(true);
          currentCaretInfo.selection.removeAllRanges();
          currentCaretInfo.selection.addRange(currentCaretInfo.range);
          // ゴーストテキストを削除する
          removeCompletionText();
        } else {
          // ゴーストテキストがないときにタブキーを押したら、スペースを2つ挿入する
          const spaceNode = document.createTextNode("  ");
          currentCaretInfo.range.insertNode(spaceNode);
          // カーソルをスペースのあとに移動
          currentCaretInfo.range.setStartAfter(spaceNode);
          currentCaretInfo.range.collapse(true);
          currentCaretInfo.selection.removeAllRanges();
          currentCaretInfo.selection.addRange(currentCaretInfo.range);
        }

        sendMessageToMicroCMS({ data: editorRef.current.innerText });
      } else if (e.key === "Escape") {
        // Escapeキーを押したら、ゴーストテキストを削除する
        e.preventDefault();
        removeCompletionText();
      }
    },
    [sendMessageToMicroCMS, getCurrentCaretInfo, removeCompletionText],
  );

  const handleBlur = useCallback(() => {
    // カーソルがエディタ要素から外れた場合、補完リクエストをキャンセルする
    resetDebounceTimeout();
    resetAbortController();
    removeCompletionText();
  }, [resetAbortController, resetDebounceTimeout, removeCompletionText]);

  useEffect(() => {
    // カーソル移動があったときなどに、ゴーストテキストを消す
    const handleSelectChange = () => {
      removeCompletionText();
    };

    const eventOptions = { passive: true, capture: true };

    document.addEventListener(
      "selectionchange",
      handleSelectChange,
      eventOptions,
    );
    return () => {
      document.removeEventListener(
        "selectionchange",
        handleSelectChange,
        eventOptions,
      );
    };
  }, [removeCompletionText]);

  return (
    <div
      ref={editorRef}
      className="editor"
      onInput={handleInput}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      role="textbox"
      tabIndex="0"
      contentEditable="plaintext-only"
      aria-multiline="true"
    />
  );
};

export { Editor };
