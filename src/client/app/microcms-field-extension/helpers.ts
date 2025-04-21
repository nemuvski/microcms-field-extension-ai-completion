import { useCallback, useEffect, useMemo, useState } from "hono/jsx";
import {
  type GetDefaultDataMessage,
  type Message,
  sendFieldExtensionMessage,
  setupFieldExtension,
} from "microcms-field-extension-api";
import { isString } from "../../../shared/string";

// CHANGEME: (必須) ご自身のmicroCMSのサービスを指定してください
// e.g. https://<your-service>.microcms.io
const MICROCMS_SERVICE_ORIGIN = "https://＜書き換えて＞.microcms.io";

// CHANGEME: microCMSの管理画面上で表示される高さに相当します
const VIEW_HEIGHT = 480;

/**
 * @see {@link https://document.microcms.io/manual/field-extension}
 */
const useMicroCMSFieldExtension = () => {
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const detach = setupFieldExtension({
      origin: MICROCMS_SERVICE_ORIGIN,
      height: VIEW_HEIGHT,
      onDefaultData(data: GetDefaultDataMessage) {
        setId(data.data.id);
        if (isString(data.data.message?.data)) {
          setDefaultValue(data.data.message.data);
        }
      },
    });
    return () => {
      detach();
    };
  }, []);

  const sendMessage = useCallback(
    (message: Message<string>) => {
      if (id) {
        sendFieldExtensionMessage({ id, message }, MICROCMS_SERVICE_ORIGIN);
      }
    },
    [id],
  );

  const isConnected = useMemo(() => id !== "", [id]);

  return [isConnected, defaultValue, sendMessage] as const;
};

export { useMicroCMSFieldExtension };
