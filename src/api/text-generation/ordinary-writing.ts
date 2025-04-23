import { BaseTextGeneration } from "./base";

class OrdinaryWritingTextGeneration extends BaseTextGeneration {
  // CHANGEME: お好みのモデルを選択してください
  protected get modelName(): keyof AiModels {
    return "@cf/meta/llama-3-8b-instruct";
  }

  // CHANGEME: 適宜変更してください
  protected get maxTokens(): number {
    return 6;
  }

  // CHANGEME: 適宜変更してください
  protected get temperature(): number {
    return 0.1;
  }

  // CHANGEME: 適宜変更してください
  protected get promptInstructions(): string {
    return `
あなたは一般的な文章の続きを補完するAIです。
以下の条件に従い、不完全な文章に自然な続きを返してください。
# 条件
- 出力は続きのみを返すこと。案内や前置きは不要です。
- 補完は入力の直後に自然につながる語句や文節のみで、一文で完結させてください。
- 入力が文法的に自然に完結していると判断できる場合は、空文字（出力なし）としてください。
- 出力の言語は入力に合わせてください。特に日本語が入力された場合は、日本語で補完してください。
- 文体は自然で明確、親しみやすいトーンにしてください。

# 入力:
${this.userInput}
# 出力:
`.trim();
  }
}

export { OrdinaryWritingTextGeneration };
