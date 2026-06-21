# 路书制作工具

面向旅行社和定制游顾问的桌面端路书制作工具，用于快速把客户需求整理成可报价的自驾方案。

## 功能模块：
1. 需求录入 - 输入人数、预算、假期长度、租车/自驾、酒店等级、小众景点偏好
2. 方案比较 - 生成舒适型、经典型、深度型三条路线草案 + 实时报价联动
3. 成稿导出 - 生成带封面、日程、地图、注意事项的 PDF，可替换品牌

## 技术栈
- Electron + Vite + React + TypeScript + TailwindCSS
- jspdf + jspdf-autotable 生成 PDF

## 启动命令
```bash
npm install
npm run start     # 开发模式（同时启动 Vite + Electron）
npm run build     # 打包为桌面应用
```
