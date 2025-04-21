import { type FC, useState } from "hono/jsx";
import { MicroCMSLogoSVG } from "../icons";

const MicroCMSConnectionStatus: FC<{ isConnected: boolean }> = ({
  isConnected,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div className="microcms-connection-status">
      <div
        className="microcms-connection-status__main"
        data-status={isConnected ? "connected" : "disconnected"}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <MicroCMSLogoSVG className="microcms-connection-status__icon" />
        <span>{isConnected ? "連携中" : "未連携"}</span>
      </div>

      <div
        className="microcms-connection-status__tooltip"
        role="tooltip"
        aria-hidden={!showTooltip}
      >
        <p aria-live="polite">
          {isConnected ? (
            <>microCMSの拡張フィールドと連携しています。</>
          ) : (
            <>
              microCMSの拡張フィールドと連携していません。
              <br />
              管理画面上以外での実行か、連携時のメッセージが受信できていません。
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export { MicroCMSConnectionStatus };
