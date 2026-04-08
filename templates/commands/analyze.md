---
description: '澶氭ā鍨嬫妧鏈垎鏋愶紙骞惰鎵ц锛夛細{{BACKEND_PRIMARY}} 鍚庣瑙嗚 + {{FRONTEND_PRIMARY}} 鍓嶇瑙嗚锛屼氦鍙夐獙璇佸悗缁煎悎瑙佽В'
---

# Analyze - 澶氭ā鍨嬫妧鏈垎鏋?
浣跨敤鍙屾ā鍨嬪苟琛屽垎鏋愶紝浜ゅ弶楠岃瘉寰楀嚭缁煎悎鎶€鏈瑙ｃ€?*浠呭垎鏋愶紝涓嶄慨鏀逛唬鐮併€?*

## 浣跨敤鏂规硶

```bash
/analyze <鍒嗘瀽闂鎴栦换鍔?
```

## 浣犵殑瑙掕壊

浣犳槸**鍒嗘瀽鍗忚皟鑰?*锛岀紪鎺掑妯″瀷鍒嗘瀽娴佺▼锛?- **ace-tool** 鈥?浠ｇ爜涓婁笅鏂囨绱?- **{{BACKEND_PRIMARY}}** 鈥?鍚庣/绯荤粺瑙嗚锛?*鍚庣鏉冨▉**锛?- **{{FRONTEND_PRIMARY}}** 鈥?鍓嶇/鐢ㄦ埛瑙嗚锛?*鍓嶇鏉冨▉**锛?- **Claude (鑷繁)** 鈥?缁煎悎瑙佽В

---

## 澶氭ā鍨嬭皟鐢ㄨ鑼?
**宸ヤ綔鐩綍**锛?- `{{WORKDIR}}`锛?*蹇呴』閫氳繃 Bash 鎵ц `pwd`锛圲nix锛夋垨 `cd`锛圵indows CMD锛夎幏鍙栧綋鍓嶅伐浣滅洰褰曠殑缁濆璺緞**锛岀姝粠 `$HOME` 鎴栫幆澧冨彉閲忔帹鏂?- 濡傛灉鐢ㄦ埛閫氳繃 `/add-dir` 娣诲姞浜嗗涓伐浣滃尯锛屽厛鐢?Glob/Grep 纭畾浠诲姟鐩稿叧鐨勫伐浣滃尯
- 濡傛灉鏃犳硶纭畾锛岀敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨鐩爣宸ヤ綔鍖?
**璋冪敤璇硶**锛堝苟琛岀敤 `run_in_background: true`锛夛細

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
闇€姹傦細<澧炲己鍚庣殑闇€姹傦紙濡傛湭澧炲己鍒欑敤 $ARGUMENTS锛?
涓婁笅鏂囷細<鍓嶅簭闃舵妫€绱㈠埌鐨勪唬鐮佷笂涓嬫枃>
</TASK>
OUTPUT: 鏈熸湜杈撳嚭鏍煎紡
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 妯″瀷 | 鎻愮ず璇?|
|------|--------|
| Codex | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md` |
| {{FRONTEND_PRIMARY}} | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md` |

**骞惰璋冪敤**锛氫娇鐢?`run_in_background: true` 鍚姩锛岀敤 `TaskOutput` 绛夊緟缁撴灉銆?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**绛夊緟鍚庡彴浠诲姟**锛堜娇鐢ㄦ渶澶ц秴鏃?600000ms = 10 鍒嗛挓锛夛細

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**閲嶈**锛?- 蹇呴』鎸囧畾 `timeout: 600000`锛屽惁鍒欓粯璁ゅ彧鏈?30 绉掍細瀵艰嚧鎻愬墠瓒呮椂銆?濡傛灉 10 鍒嗛挓鍚庝粛鏈畬鎴愶紝缁х画鐢?`TaskOutput` 杞锛?*缁濆涓嶈 Kill 杩涚▼**銆?- 鑻ュ洜绛夊緟鏃堕棿杩囬暱璺宠繃浜嗙瓑寰?TaskOutput 缁撴灉锛屽垯**蹇呴』璋冪敤 `AskUserQuestion` 宸ュ叿璇㈤棶鐢ㄦ埛閫夋嫨缁х画绛夊緟杩樻槸 Kill Task銆傜姝㈢洿鎺?Kill Task銆?*
- 鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶈烦杩?{{FRONTEND_PRIMARY}} 缁撴灉骞朵娇鐢ㄥ崟妯″瀷缁撴灉缁х画銆?- 鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц鏃堕棿杈冮暱锛?-15 鍒嗛挓锛夊睘浜庢甯搞€俆askOutput 瓒呮椂鍚庡繀椤荤户缁敤 TaskOutput 杞锛?*缁濆绂佹鍦?Codex 鏈繑鍥炵粨鏋滄椂鐩存帴璺宠繃鎴栫户缁笅涓€闃舵**銆傚凡鍚姩鐨?Codex 浠诲姟鑻ヨ璺宠繃 = 娴垂 token + 涓㈠け缁撴灉銆?
---

## 鎵ц宸ヤ綔娴?
**鍒嗘瀽浠诲姟**锛?ARGUMENTS

### 馃攳 闃舵 0锛歅rompt 澧炲己锛堝彲閫夛級

`[妯″紡锛氬噯澶嘳` - **Prompt 澧炲己**锛堟寜 `/ccg:enhance` 鐨勯€昏緫鎵ц锛夛細鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁撅紝琛ュ叏涓虹粨鏋勫寲闇€姹傦紙鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗭級锛?*鐢ㄥ寮虹粨鏋滄浛浠ｅ師濮?$ARGUMENTS锛屽悗缁皟鐢?{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鏃朵紶鍏ュ寮哄悗鐨勯渶姹?*

### 馃攳 闃舵 1锛氫笂涓嬫枃妫€绱?
`[妯″紡锛氱爺绌禲`

1. 璋冪敤 `{{MCP_SEARCH_TOOL}}` 妫€绱㈢浉鍏充唬鐮?2. 璇嗗埆鍒嗘瀽鑼冨洿鍜屽叧閿粍浠?3. 鍒楀嚭宸茬煡绾︽潫鍜屽亣璁?
### 馃挕 闃舵 2锛氬苟琛屽垎鏋?
`[妯″紡锛氬垎鏋怾`

**鈿狅笍 蹇呴』鍙戣捣涓や釜骞惰 Bash 璋冪敤**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?
1. **{{BACKEND_PRIMARY}} 鍚庣鍒嗘瀽**锛歚Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md`
   - OUTPUT锛氭妧鏈彲琛屾€с€佹灦鏋勫奖鍝嶃€佹€ц兘鑰冮噺

2. **{{FRONTEND_PRIMARY}} 鍓嶇鍒嗘瀽**锛歚Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md`
   - OUTPUT锛歎I/UX 褰卞搷銆佺敤鎴蜂綋楠屻€佽瑙夎璁¤€冮噺

鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁寸粨鏋溿€?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**鍔″繀閬靛惊涓婃柟 `澶氭ā鍨嬭皟鐢ㄨ鑼僠 鐨?`閲嶈` 鎸囩ず**

### 馃攢 闃舵 3锛氫氦鍙夐獙璇?
`[妯″紡锛氶獙璇乚`

1. 瀵规瘮鍙屾柟鍒嗘瀽缁撴灉
2. 璇嗗埆锛?   - **涓€鑷磋鐐?*锛堝己淇″彿锛?   - **鍒嗘鐐?*锛堥渶鏉冭　锛?   - **浜掕ˉ瑙佽В**锛堝悇鑷鍩熸礊瀵燂級
3. 鎸変俊浠昏鍒欐潈琛★細鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯

### 馃搳 闃舵 4锛氱患鍚堣緭鍑?
`[妯″紡锛氭€荤粨]`

```markdown
## 馃敩 鎶€鏈垎鏋愶細<涓婚>

### 涓€鑷磋鐐癸紙寮轰俊鍙凤級
1. <鍙屾柟閮借鍚岀殑鐐?

### 鍒嗘鐐癸紙闇€鏉冭　锛?| 璁 | Codex 瑙傜偣 | {{FRONTEND_PRIMARY}} 瑙傜偣 | 寤鸿 |
|------|------------|-------------|------|

### 鏍稿績缁撹
<1-2 鍙ヨ瘽鎬荤粨>

### 鎺ㄨ崘鏂规
**棣栭€?*锛?鏂规>
- 鐞嗙敱 / 椋庨櫓 / 缂撹В鎺柦

### 鍚庣画琛屽姩
1. [ ] <鍏蜂綋姝ラ>
```

---

## 閫傜敤鍦烘櫙

| 鍦烘櫙 | 绀轰緥 |
|------|------|
| 鎶€鏈€夊瀷 | "姣旇緝 Redux vs Zustand" |
| 鏋舵瀯璇勪及 | "璇勪及寰湇鍔℃媶鍒嗘柟妗? |
| 鎬ц兘鍒嗘瀽 | "鍒嗘瀽 API 鍝嶅簲鎱㈢殑鍘熷洜" |
| 瀹夊叏瀹¤ | "璇勪及璁よ瘉妯″潡瀹夊叏鎬? |

## 鍏抽敭瑙勫垯

1. **浠呭垎鏋愪笉淇敼** 鈥?鏈懡浠や笉鎵ц浠讳綍浠ｇ爜鍙樻洿
2. **淇′换瑙勫垯** 鈥?鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯
3. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*



