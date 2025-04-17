# sidellama

## connections 连接

![](/docs/connections.png)

### ollama

- [install ollama](https://ollama.com/download) [安装 ollama]
- 或者使用命令行安装：`curl -fsSL https://ollama.com/install.sh | sh`

```
# 从 https://ollama.com/library 选择一个模型
ollama pull phi3

# 启动服务
ollama serve
```

### LM Studio

- [install LM Studio](https://lmstudio.ai/) [安装 LM Studio]
- 从主页下载模型，或使用搜索标签从 huggingface 获取
- 转到 `Local server` 标签页，点击 `Start server`，然后选择你下载的模型

### groq

Groq 提供多种模型，并有慷慨的免费额度。
- [官网](https://groq.com/)
- [创建 API 密钥](https://console.groq.com/keys)

## persona 个性化助手

![](/docs/persona.png)

创建和修改你自己的个性化助手！

查看这些集合以获取灵感：
- [0xeb/TheBigPromptLibrary](https://github.com/0xeb/TheBigPromptLibrary)
- [sockcymbal/persona_library](https://github.com/sockcymbal/enhanced-llm-reasoning-tree-of-thoughts/blob/main/persona_library.md)
- [abilzerian/LLM-Prompt-Library](https://github.com/abilzerian/LLM-Prompt-Library)
- [kaushikb11/awesome-llm-agents](https://github.com/kaushikb11/awesome-llm-agents)

## page context 页面上下文

![](/docs/pageContext.png)

使用当前访问的网页内容来增强你的对话。

- 选择 `text mode` 来分享页面的文本内容
- 选择 `html mode` 来分享网站的源代码（资源密集型，仅用于开发目的）
- 调整 `char limit` 来控制你想在对话中分享的最大字符数。如果你的上下文窗口有限，请减少这个数值。

## web search 网络搜索

![](/docs/webSearch.png)

为你的聊天提供基本的网络增强功能。输入你的网络搜索查询，sidellama 将加载异步网络搜索，基于实时公共数据回答你的问题。

- 你可以选择 `duckduckgo` 或 `brave` 作为你的网络数据源
- 调整 `char limit` 来控制你想在对话中分享的最大字符数。如果你的上下文窗口有限，请减少这个数值。
