abstract class BaseTextGeneration {
  readonly userInput: string;

  protected readonly ai: Ai;

  /**
   * モデル名
   */
  protected abstract get modelName(): keyof AiModels;

  /**
   * 生成するトークンの最大数
   */
  protected abstract get maxTokens(): number;

  /**
   * 単語やトークンを選択する際のランダム性と創造性の調整を行うパラメータ
   */
  protected abstract get temperature(): number;

  /**
   * AIの振る舞い、前提知識などを事前に設定する指示文
   */
  protected abstract get promptInstructions(): string;

  constructor(binding: CloudflareBindings["AI"], userInput: string) {
    this.ai = binding;
    this.userInput = userInput;
  }

  async request() {
    const answer = await this.ai.run(this.modelName, {
      prompt: this.promptInstructions,
      stream: false,
      raw: false,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    if (!answer || !isReponseJson(answer)) {
      // 返答が空または不正な場合は、エラー
      throw new Error("No response or invalid response");
    }

    if (answer.response === "") {
      // 補完が不要な場合は、ここで終了する
      return "";
    }

    // 補完結果に、入力の末尾が重複する場合を考慮し、重複部分を削除する
    // 加えて、末尾の空白を削除する
    return removeOverlap(this.userInput, answer.response).trim();
  }
}

type Answer = {
  response: string;
};

const isReponseJson = (response: unknown): response is Answer => {
  if (typeof response !== "object" || response === null) {
    return false;
  }
  if (!("response" in response)) {
    return false;
  }
  if (typeof (response as Answer).response !== "string") {
    return false;
  }
  return true;
};

/**
 * 補完結果の重複部分を削除する
 */
const removeOverlap = (input: string, completion: string): string => {
  let overlap = 0;
  const maxLen = Math.min(input.length, completion.length);
  for (let i = maxLen; i > 0; i--) {
    if (input.endsWith(completion.slice(0, i))) {
      overlap = i;
      break;
    }
  }
  return completion.slice(overlap);
};

export { BaseTextGeneration };
