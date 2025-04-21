import type { FC } from "hono/jsx";
import { TextGenerationKind } from "../../../shared/text-generation";
import { EditSVG, LoaderSVG, RobotSVG } from "../icons";
import { useCompletionInternal } from "./provider";

const ToggleSwitch: FC = () => {
  const { enabled, toggleSwitchState } = useCompletionInternal();

  return (
    <label className="toggle-switch">
      <span className="visibility-hidden">
        ライティング補完機能の有効・無効の切替
      </span>
      <input
        className="visibility-hidden"
        type="checkbox"
        role="switch"
        aria-checked={enabled}
        onChange={(_event) => {
          toggleSwitchState();
        }}
      />
      <RobotSVG className="toggle-switch__icon" enabled={enabled} />
    </label>
  );
};

const SelectWritingMode: FC = () => {
  const { enabled, writingMode, changeWritingMode } = useCompletionInternal();

  return (
    <label className="select-writing-mode" aria-disabled={!enabled}>
      <span className="visibility-hidden">補完モードを選択</span>
      <EditSVG className="select-writing-mode__icon" />
      <select
        className="select-writing-mode__select"
        value={writingMode}
        disabled={!enabled}
        onChange={(event) => {
          if (!enabled) {
            return;
          }

          const target = event.currentTarget as HTMLSelectElement;
          const value = target.value;

          changeWritingMode(value);
        }}
      >
        <option value={TextGenerationKind.ORDINARY}>一般的な文章向け</option>
        <option value={TextGenerationKind.TECHNICAL}>技術的な文章向け</option>
      </select>
    </label>
  );
};

const CompletionLoader: FC = () => {
  const { isRequesting } = useCompletionInternal();

  if (!isRequesting) {
    return null;
  }

  return <LoaderSVG className="completion-loader" />;
};

export { ToggleSwitch, SelectWritingMode, CompletionLoader };
