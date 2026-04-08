---
description: '澶氭ā鍨嬩唬鐮佸鏌ワ細鏃犲弬鏁版椂鑷姩瀹℃煡 git diff锛屽弻妯″瀷浜ゅ弶楠岃瘉'
---

# Review - 澶氭ā鍨嬩唬鐮佸鏌?
鍙屾ā鍨嬪苟琛屽鏌ワ紝浜ゅ弶楠岃瘉缁煎悎鍙嶉銆傛棤鍙傛暟鏃惰嚜鍔ㄥ鏌ュ綋鍓?git 鍙樻洿銆?
## 浣跨敤鏂规硶

```bash
/review [浠ｇ爜鎴栨弿杩癩
```

- **鏃犲弬鏁?*锛氳嚜鍔ㄥ鏌?`git diff HEAD`
- **鏈夊弬鏁?*锛氬鏌ユ寚瀹氫唬鐮佹垨鎻忚堪

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
瀹℃煡浠ヤ笅浠ｇ爜鍙樻洿锛?<git diff 鍐呭>
</TASK>
OUTPUT: 鎸?Critical/Major/Minor/Suggestion 鍒嗙被鍒楀嚭闂
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 妯″瀷 | 鎻愮ず璇?|
|------|--------|
| Codex | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md` |
| {{FRONTEND_PRIMARY}} | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md` |

**骞惰璋冪敤**锛氫娇鐢?`run_in_background: true` 鍚姩锛岀敤 `TaskOutput` 绛夊緟缁撴灉銆?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**绛夊緟鍚庡彴浠诲姟**锛堜娇鐢ㄦ渶澶ц秴鏃?600000ms = 10 鍒嗛挓锛夛細

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**閲嶈**锛?- 蹇呴』鎸囧畾 `timeout: 600000`锛屽惁鍒欓粯璁ゅ彧鏈?30 绉掍細瀵艰嚧鎻愬墠瓒呮椂銆?濡傛灉 10 鍒嗛挓鍚庝粛鏈畬鎴愶紝缁х画鐢?`TaskOutput` 杞锛?*缁濆涓嶈 Kill 杩涚▼**銆?- 鑻ュ洜绛夊緟鏃堕棿杩囬暱璺宠繃浜嗙瓑寰?TaskOutput 缁撴灉锛屽垯**蹇呴』璋冪敤 `AskUserQuestion` 宸ュ叿璇㈤棶鐢ㄦ埛閫夋嫨缁х画绛夊緟杩樻槸 Kill Task銆傜姝㈢洿鎺?Kill Task銆?*
- 鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶈烦杩?{{FRONTEND_PRIMARY}} 缁撴灉骞朵娇鐢ㄥ崟妯″瀷缁撴灉缁х画銆?- 鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц鏃堕棿杈冮暱锛?-15 鍒嗛挓锛夊睘浜庢甯搞€俆askOutput 瓒呮椂鍚庡繀椤荤户缁敤 TaskOutput 杞锛?*缁濆绂佹鍦?Codex 鏈繑鍥炵粨鏋滄椂鐩存帴璺宠繃鎴栫户缁笅涓€闃舵**銆傚凡鍚姩鐨?Codex 浠诲姟鑻ヨ璺宠繃 = 娴垂 token + 涓㈠け缁撴灉銆?
---

## 鎵ц宸ヤ綔娴?
### 馃攳 闃舵 1锛氳幏鍙栧緟瀹℃煡浠ｇ爜

`[妯″紡锛氱爺绌禲`

**鏃犲弬鏁版椂**锛氭墽琛?`git diff HEAD` 鍜?`git status --short`

**鏈夊弬鏁版椂**锛氫娇鐢ㄦ寚瀹氱殑浠ｇ爜/鎻忚堪

璋冪敤 `{{MCP_SEARCH_TOOL}}` 鑾峰彇鐩稿叧涓婁笅鏂囥€?
### 馃敩 闃舵 2锛氬苟琛屽鏌?
`[妯″紡锛氬鏌`

**鈿狅笍 蹇呴』鍙戣捣涓や釜骞惰 Bash 璋冪敤**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?
1. **{{BACKEND_PRIMARY}} 鍚庣瀹℃煡**锛歚Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md`
   - 闇€姹傦細瀹℃煡浠ｇ爜鍙樻洿锛坓it diff 鍐呭锛?   - OUTPUT锛氭寜 Critical/Major/Minor/Suggestion 鍒嗙被鍒楀嚭瀹夊叏鎬с€佹€ц兘銆侀敊璇鐞嗛棶棰?
2. **{{FRONTEND_PRIMARY}} 鍓嶇瀹℃煡**锛歚Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md`
   - 闇€姹傦細瀹℃煡浠ｇ爜鍙樻洿锛坓it diff 鍐呭锛?   - OUTPUT锛氭寜 Critical/Major/Minor/Suggestion 鍒嗙被鍒楀嚭鍙闂€с€佸搷搴斿紡銆佽璁′竴鑷存€ч棶棰?
鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫鏌ョ粨鏋溿€?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**鍔″繀閬靛惊涓婃柟 `澶氭ā鍨嬭皟鐢ㄨ鑼僠 鐨?`閲嶈` 鎸囩ず**

### 馃攢 闃舵 3锛氱患鍚堝弽棣?
`[妯″紡锛氱患鍚圿`

1. 鏀堕泦鍙屾柟瀹℃煡缁撴灉
2. 鎸変弗閲嶇▼搴﹀垎绫伙細Critical / Major / Minor / Suggestion
3. 鍘婚噸鍚堝苟 + 浜ゅ弶楠岃瘉

### 馃搳 闃舵 4锛氬憟鐜板鏌ョ粨鏋?
`[妯″紡锛氭€荤粨]`

```markdown
## 馃搵 浠ｇ爜瀹℃煡鎶ュ憡

### 瀹℃煡鑼冨洿
- 鍙樻洿鏂囦欢锛?鏁伴噺> | 浠ｇ爜琛屾暟锛?X / -Y

### 鍏抽敭闂 (Critical)
> 蹇呴』淇鎵嶈兘鍚堝苟
1. <闂鎻忚堪> - [{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}}]

### 涓昏闂 (Major) / 娆¤闂 (Minor) / 寤鸿 (Suggestions)
...

### 鎬讳綋璇勪环
- 浠ｇ爜璐ㄩ噺锛歔浼樼/鑹ソ/闇€鏀硅繘]
- 鏄惁鍙悎骞讹細[鏄?鍚?闇€淇鍚嶿
```

---

## 鍏抽敭瑙勫垯

1. **鏃犲弬鏁?= 瀹℃煡 git diff** 鈥?鑷姩鑾峰彇褰撳墠鍙樻洿
2. **鍙屾ā鍨嬩氦鍙夐獙璇?* 鈥?鍚庣闂浠?Codex 涓哄噯锛屽墠绔棶棰樹互 {{FRONTEND_PRIMARY}} 涓哄噯
3. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*


