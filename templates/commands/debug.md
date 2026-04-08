---
description: '澶氭ā鍨嬭皟璇曪細{{BACKEND_PRIMARY}} 鍚庣璇婃柇 + {{FRONTEND_PRIMARY}} 鍓嶇璇婃柇锛屼氦鍙夐獙璇佸畾浣嶉棶棰?
---

# Debug - 澶氭ā鍨嬭皟璇?
鍙屾ā鍨嬪苟琛岃瘖鏂紝浜ゅ弶楠岃瘉蹇€熷畾浣嶉棶棰樻牴鍥犮€?
## 浣跨敤鏂规硶

```bash
/debug <闂鎻忚堪>
```

## 浣犵殑瑙掕壊

浣犳槸**璋冭瘯鍗忚皟鑰?*锛岀紪鎺掑妯″瀷璇婃柇娴佺▼锛?- **{{BACKEND_PRIMARY}}** 鈥?鍚庣璇婃柇锛?*鍚庣闂鏉冨▉**锛?- **{{FRONTEND_PRIMARY}}** 鈥?鍓嶇璇婃柇锛?*鍓嶇闂鏉冨▉**锛?- **Claude (鑷繁)** 鈥?缁煎悎璇婃柇銆佹墽琛屼慨澶?
---

## 澶氭ā鍨嬭皟鐢ㄨ鑼?
**宸ヤ綔鐩綍**锛?- 濡傛灉鐢ㄦ埛閫氳繃 `/add-dir` 娣诲姞浜嗗涓伐浣滃尯锛屽厛鐢?Glob/Grep 纭畾浠诲姟鐩稿叧鐨勫伐浣滃尯
- 濡傛灉鏃犳硶纭畾锛岀敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨鐩爣宸ヤ綔鍖?- **蹇呴』閫氳繃 Bash 鎵ц `pwd`锛圲nix锛夋垨 `cd`锛圵indows CMD锛夎幏鍙栧綋鍓嶅伐浣滅洰褰曠殑缁濆璺緞**锛岀姝粠 `$HOME` 鎴栫幆澧冨彉閲忔帹鏂?
**璋冪敤绀轰緥**锛?
**{{BACKEND_PRIMARY}} 鍚庣璇婃柇**锛?```bash
~/.claude/bin/codeagent-wrapper --progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- "$(pwd)" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/debugger.md
<TASK>
闇€姹傦細<澧炲己鍚庣殑闇€姹?
涓婁笅鏂囷細<閿欒鏃ュ織銆佸爢鏍堜俊鎭€佸鐜版楠?
</TASK>
OUTPUT: 璇婃柇鍋囪锛堟寜鍙兘鎬ф帓搴忥級
EOF
```

**{{FRONTEND_PRIMARY}} 鍓嶇璇婃柇**锛?```bash
~/.claude/bin/codeagent-wrapper --progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- "$(pwd)" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/debugger.md
<TASK>
闇€姹傦細<澧炲己鍚庣殑闇€姹?
涓婁笅鏂囷細<閿欒鏃ュ織銆佸爢鏍堜俊鎭€佸鐜版楠?
</TASK>
OUTPUT: 璇婃柇鍋囪锛堟寜鍙兘鎬ф帓搴忥級
EOF
```

**瑙掕壊鎻愮ず璇?*锛?
| 妯″瀷 | 鎻愮ず璇?|
|------|--------|
| Codex | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/debugger.md` |
| {{FRONTEND_PRIMARY}} | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/debugger.md` |

**骞惰璋冪敤**锛?1. 浣跨敤 `Bash` 宸ュ叿锛岃缃?`run_in_background: true` 鍜?`timeout: 600000`锛?0 鍒嗛挓锛?2. 鍚屾椂鍙戣捣涓や釜鍚庡彴浠诲姟锛圕odex + {{FRONTEND_PRIMARY}}锛?3. 浣跨敤 `TaskOutput` 绛夊緟缁撴灉锛歚TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })`

**閲嶈**锛?- 蹇呴』鎸囧畾 `timeout: 600000`锛屽惁鍒欓粯璁?30 绉掍細瓒呮椂
- 濡傛灉 10 鍒嗛挓鍚庝粛鏈畬鎴愶紝缁х画鐢?`TaskOutput` 杞锛?*缁濆涓嶈 Kill 杩涚▼**
- 鑻ョ瓑寰呮椂闂磋繃闀匡紝**蹇呴』鐢?`AskUserQuestion` 璇㈤棶鐢ㄦ埛鏄惁缁х画绛夊緟锛岀姝㈢洿鎺?Kill**
- 鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶈烦杩?{{FRONTEND_PRIMARY}} 缁撴灉骞朵娇鐢ㄥ崟妯″瀷缁撴灉缁х画銆?- 鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц鏃堕棿杈冮暱锛?-15 鍒嗛挓锛夊睘浜庢甯搞€俆askOutput 瓒呮椂鍚庡繀椤荤户缁敤 TaskOutput 杞锛?*缁濆绂佹鍦?Codex 鏈繑鍥炵粨鏋滄椂鐩存帴璺宠繃鎴栫户缁笅涓€闃舵**銆傚凡鍚姩鐨?Codex 浠诲姟鑻ヨ璺宠繃 = 娴垂 token + 涓㈠け缁撴灉銆?
---

## 鎵ц宸ヤ綔娴?
**闂鎻忚堪**锛?ARGUMENTS

### 馃攳 闃舵 0锛歅rompt 澧炲己锛堝彲閫夛級

`[妯″紡锛氬噯澶嘳` - **Prompt 澧炲己**锛堟寜 `/ccg:enhance` 鐨勯€昏緫鎵ц锛夛細鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁撅紝琛ュ叏涓虹粨鏋勫寲闇€姹傦紙鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗭級锛?*鐢ㄥ寮虹粨鏋滄浛浠ｅ師濮?$ARGUMENTS锛屽悗缁皟鐢?{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鏃朵紶鍏ュ寮哄悗鐨勯渶姹?*

### 馃攳 闃舵 1锛氫笂涓嬫枃鏀堕泦

`[妯″紡锛氱爺绌禲`

1. 璋冪敤 `{{MCP_SEARCH_TOOL}}` 妫€绱㈢浉鍏充唬鐮侊紙濡傚彲鐢級
2. 鏀堕泦閿欒鏃ュ織銆佸爢鏍堜俊鎭€佸鐜版楠?3. 璇嗗埆闂绫诲瀷锛歔鍚庣/鍓嶇/鍏ㄦ爤]

### 馃敩 闃舵 2锛氬苟琛岃瘖鏂?
`[妯″紡锛氳瘖鏂璢`

**鈿狅笍 蹇呴』鍙戣捣涓や釜骞惰 Bash 璋冪敤**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?
1. **{{BACKEND_PRIMARY}} 鍚庣璇婃柇**锛歚Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/debugger.md`
   - OUTPUT锛氳瘖鏂亣璁撅紙鎸夊彲鑳芥€ф帓搴忥級锛屾瘡涓亣璁惧寘鍚師鍥犮€佽瘉鎹€佷慨澶嶅缓璁?
2. **{{FRONTEND_PRIMARY}} 鍓嶇璇婃柇**锛歚Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/debugger.md`
   - OUTPUT锛氳瘖鏂亣璁撅紙鎸夊彲鑳芥€ф帓搴忥級锛屾瘡涓亣璁惧寘鍚師鍥犮€佽瘉鎹€佷慨澶嶅缓璁?
鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勮瘖鏂粨鏋溿€?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**鍔″繀閬靛惊涓婃柟 `澶氭ā鍨嬭皟鐢ㄨ鑼僠 鐨?`閲嶈` 鎸囩ず**

### 馃攢 闃舵 3锛氬亣璁炬暣鍚?
`[妯″紡锛氶獙璇乚`

1. 浜ゅ弶楠岃瘉鍙屾柟璇婃柇缁撴灉
2. 绛涢€?**Top 1-2 鏈€鍙兘鍘熷洜**
3. 璁捐楠岃瘉绛栫暐

### 鉀?闃舵 4锛氱敤鎴风‘璁わ紙Hard Stop锛?
`[妯″紡锛氱‘璁`

```markdown
## 馃攳 璇婃柇缁撴灉

### Codex 鍒嗘瀽锛堝悗绔瑙掞級
<璇婃柇鎽樿>

### {{FRONTEND_PRIMARY}} 鍒嗘瀽锛堝墠绔瑙掞級
<璇婃柇鎽樿>

### 缁煎悎璇婃柇
**鏈€鍙兘鍘熷洜**锛?鍏蜂綋璇婃柇>
**楠岃瘉鏂规**锛?濡備綍纭>

---
**纭鍚庢垜灏嗘墽琛屼慨澶嶃€傛槸鍚︾户缁紵(Y/N)**
```

**鈿狅笍 蹇呴』绛夊緟鐢ㄦ埛纭鍚庢墠鑳借繘鍏ラ樁娈?5**

### 馃敡 闃舵 5锛氫慨澶嶄笌楠岃瘉

`[妯″紡锛氭墽琛宂`

鐢ㄦ埛纭鍚庯細
1. 鏍规嵁璇婃柇瀹炴柦淇
2. 杩愯娴嬭瘯楠岃瘉淇

---

## 鍏抽敭瑙勫垯

1. **鐢ㄦ埛纭** 鈥?淇鍓嶅繀椤昏幏寰楃‘璁?2. **淇′换瑙勫垯** 鈥?鍚庣闂浠?Codex 涓哄噯锛屽墠绔棶棰樹互 {{FRONTEND_PRIMARY}} 涓哄噯
3. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*



