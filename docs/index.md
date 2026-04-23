---
layout: home

hero:
  name: CCSM
  text: Codex 主控的规范协作工作流
  tagline: OpenSpec 负责收敛边界，Codex 负责推进与验收，Claude Agent Teams 负责有边界的执行实现。
  actions:
    - theme: brand
      text: 三分钟上手
      link: /guide/getting-started
    - theme: alt
      text: 看看有哪些命令
      link: /guide/commands
    - theme: alt
      text: GitHub
      link: https://github.com/Catsofsuffering/ccsm

features:
  - icon: 🔀
    title: Codex 主控推进
    details: 主路径由 Codex 推进 change、收敛方案、准备交接契约，再决定是否验收和归档。
  - icon: 🔒
    title: 执行边界清晰
    details: 先把需求变成约束、验收条件和受限改动面，再把实现工作交给 Claude Agent Teams 执行。
  - icon: 📐
    title: OpenSpec 驱动
    details: proposal、design、tasks 和 review 构成主线，避免实现阶段重新做产品决策。
  - icon: 👥
    title: Claude Agent Teams 执行
    details: 执行层仍然可以并行拆分任务，但现在它是 Codex 调度下的实现层，而不是默认编排中心。
  - icon: ⚡
    title: Codex 原生入口
    details: 安装后可直接从 Codex 技能启动主路径，不必再把 Claude 当作唯一宿主入口。
  - icon: 🧩
    title: 可选增强仍可用
    details: MCP 和其他 skills 仍然可接入，但它们不再决定默认产品叙事。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
}
</style>
