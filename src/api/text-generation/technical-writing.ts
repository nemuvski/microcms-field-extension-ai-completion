import { BaseTextGeneration } from "./base";

class TechnicalWritingTextGeneration extends BaseTextGeneration {
  // CHANGEME: お好みのモデルを選択してください
  protected get modelName(): keyof AiModels {
    return "@cf/meta/llama-3-8b-instruct";
  }

  // CHANGEME: 適宜変更してください
  protected get maxTokens(): number {
    return 10;
  }

  // CHANGEME: 適宜変更してください
  protected get temperature(): number {
    return 0.1;
  }

  // CHANGEME: 適宜変更してください
  protected get promptInstructions(): string {
    return `
あなたはテクニカルライティングの補完を行うAIです。
以下の条件に従い、不完全な手順説明・技術解説などの続きを補完してください。
# 条件
- 出力は続きのみを返すこと。案内や前置きは不要です。
- 補完は入力の直後に自然につながる語句や文節のみで、一文で完結させてください。
- 入力が文法的に自然に完結していると判断できる場合は、空文字（出力なし）としてください。
- 出力の言語は入力に合わせてください。特に日本語が入力された場合は、日本語で補完してください。
- 文体は簡潔かつ正確で、開発者向けの技術的表現に限定してください。

# 入力:
${this.userInput}
# 出力:
`.trim();
  }
}

export { TechnicalWritingTextGeneration };
