import type { FC } from "hono/jsx";
import {
  CompletionLoader,
  CompletionProvider,
  SelectWritingMode,
  ToggleSwitch,
} from "./completion";
import { Editor } from "./editor";
import {
  MicroCMSConnectionStatus,
  useMicroCMSFieldExtension,
} from "./microcms-field-extension";

const App: FC = () => {
  const [isConnected, defaultValue, sendMessage] = useMicroCMSFieldExtension();

  return (
    <CompletionProvider>
      <div className="layout">
        <main className="layout__main">
          <Editor
            defaultValue={defaultValue}
            sendMessageToMicroCMS={sendMessage}
          />
        </main>

        <footer className="layout__footer">
          <div className="layout__footer-inner">
            <ToggleSwitch />
            <SelectWritingMode />
            <CompletionLoader />
          </div>

          <div className="layout__footer-inner">
            <MicroCMSConnectionStatus isConnected={isConnected} />
          </div>
        </footer>
      </div>
    </CompletionProvider>
  );
};

export default App;
