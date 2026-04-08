---
description: '鍓嶇涓撻」宸ヤ綔娴侊紙鐮旂┒鈫掓瀯鎬濃啋璁″垝鈫掓墽琛屸啋浼樺寲鈫掕瘎瀹★級锛寋{FRONTEND_PRIMARY}} 涓诲'
---

# Frontend - 鍓嶇涓撻」寮€鍙?
## 浣跨敤鏂规硶

```bash
/frontend <UI浠诲姟鎻忚堪>
```

## 涓婁笅鏂?
- 鍓嶇浠诲姟锛?ARGUMENTS
- {{FRONTEND_PRIMARY}} 涓诲锛寋{BACKEND_PRIMARY}} 杈呭姪鍙傝€?- 閫傜敤锛氱粍浠惰璁°€佸搷搴斿紡甯冨眬銆乁I 鍔ㄧ敾銆佹牱寮忎紭鍖?
## 浣犵殑瑙掕壊

浣犳槸**鍓嶇缂栨帓鑰?*锛屽崗璋冨妯″瀷瀹屾垚 UI/UX 浠诲姟锛堢爺绌?鈫?鏋勬€?鈫?璁″垝 鈫?鎵ц 鈫?浼樺寲 鈫?璇勫锛夛紝鐢ㄤ腑鏂囧崗鍔╃敤鎴枫€?
**鍗忎綔妯″瀷**锛?- **{{FRONTEND_PRIMARY}}** 鈥?鍓嶇 UI/UX锛?*鍓嶇鏉冨▉锛屽彲淇¤禆**锛?- **{{BACKEND_PRIMARY}}** 鈥?鍚庣瑙嗚锛?*鍓嶇鎰忚浠呬緵鍙傝€?*锛?- **Claude (鑷繁)** 鈥?缂栨帓銆佽鍒掋€佹墽琛屻€佷氦浠?
---

## 澶氭ā鍨嬭皟鐢ㄨ鑼?
**宸ヤ綔鐩綍**锛?- `{{WORKDIR}}`锛?*蹇呴』閫氳繃 Bash 鎵ц `pwd`锛圲nix锛夋垨 `cd`锛圵indows CMD锛夎幏鍙栧綋鍓嶅伐浣滅洰褰曠殑缁濆璺緞**锛岀姝粠 `$HOME` 鎴栫幆澧冨彉閲忔帹鏂?- 濡傛灉鐢ㄦ埛閫氳繃 `/add-dir` 娣诲姞浜嗗涓伐浣滃尯锛屽厛鐢?Glob/Grep 纭畾浠诲姟鐩稿叧鐨勫伐浣滃尯
- 濡傛灉鏃犳硶纭畾锛岀敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨鐩爣宸ヤ綔鍖?
**璋冪敤璇硶**锛?
```
# 鏂颁細璇濊皟鐢?Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
闇€姹傦細<澧炲己鍚庣殑闇€姹傦紙濡傛湭澧炲己鍒欑敤 $ARGUMENTS锛?
涓婁笅鏂囷細<鍓嶅簭闃舵鏀堕泦鐨勯」鐩笂涓嬫枃銆佸垎鏋愮粨鏋滅瓑>
</TASK>
OUTPUT: 鏈熸湜杈撳嚭鏍煎紡
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})

# 澶嶇敤浼氳瘽璋冪敤
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <FRONTEND_SESSION> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
闇€姹傦細<澧炲己鍚庣殑闇€姹傦紙濡傛湭澧炲己鍒欑敤 $ARGUMENTS锛?
涓婁笅鏂囷細<鍓嶅簭闃舵鏀堕泦鐨勯」鐩笂涓嬫枃銆佸垎鏋愮粨鏋滅瓑>
</TASK>
OUTPUT: 鏈熸湜杈撳嚭鏍煎紡
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 闃舵 | {{FRONTEND_PRIMARY}} |
|------|--------|
| 鍒嗘瀽 | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md` |
| 瑙勫垝 | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md` |
| 瀹℃煡 | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md` |

**浼氳瘽澶嶇敤**锛氭瘡娆¤皟鐢ㄨ繑鍥?`SESSION_ID: xxx`锛屽悗缁樁娈电敤 `resume xxx` 澶嶇敤涓婁笅鏂囥€傞樁娈?2 淇濆瓨 `FRONTEND_SESSION`锛岄樁娈?3 鍜?5 浣跨敤 `resume` 澶嶇敤銆?
鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶆姤鍛婇敊璇苟缁堟銆?
---

## 娌熼€氬畧鍒?
1. 鍝嶅簲浠ユā寮忔爣绛?`[妯″紡锛歑]` 寮€濮嬶紝鍒濆涓?`[妯″紡锛氱爺绌禲`
2. 涓ユ牸鎸?`鐮旂┒ 鈫?鏋勬€?鈫?璁″垝 鈫?鎵ц 鈫?浼樺寲 鈫?璇勫` 椤哄簭娴佽浆
3. 鍦ㄩ渶瑕佽闂敤鎴锋椂锛屽敖閲忎娇鐢?`AskUserQuestion` 宸ュ叿杩涜浜や簰锛屼妇渚嬪満鏅細璇锋眰鐢ㄦ埛纭/閫夋嫨/鎵瑰噯

---

## 鏍稿績宸ヤ綔娴?
### 馃攳 闃舵 0锛歅rompt 澧炲己锛堝彲閫夛級

`[妯″紡锛氬噯澶嘳` - **Prompt 澧炲己**锛堟寜 `/ccg:enhance` 鐨勯€昏緫鎵ц锛夛細鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁撅紝琛ュ叏涓虹粨鏋勫寲闇€姹傦紙鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗭級锛?*鐢ㄥ寮虹粨鏋滄浛浠ｅ師濮?$ARGUMENTS锛屽悗缁皟鐢?{{FRONTEND_PRIMARY}} 鏃朵紶鍏ュ寮哄悗鐨勯渶姹?*

### 馃攳 闃舵 1锛氱爺绌?
`[妯″紡锛氱爺绌禲` - 鐞嗚В闇€姹傚苟鏀堕泦涓婁笅鏂?
1. **浠ｇ爜妫€绱?*锛堝 ace-tool MCP 鍙敤锛夛細璋冪敤 `{{MCP_SEARCH_TOOL}}` 妫€绱㈢幇鏈夌粍浠躲€佹牱寮忋€佽璁＄郴缁?2. 闇€姹傚畬鏁存€ц瘎鍒嗭紙0-10 鍒嗭級锛氣墺7 缁х画锛?7 鍋滄琛ュ厖

### 馃挕 闃舵 2锛氭瀯鎬?
`[妯″紡锛氭瀯鎬漖` - {{FRONTEND_PRIMARY}} 涓诲鍒嗘瀽

**鈿狅笍 蹇呴』璋冪敤 {{FRONTEND_PRIMARY}}**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?- ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md`
- 闇€姹傦細澧炲己鍚庣殑闇€姹傦紙濡傛湭澧炲己鍒欑敤 $ARGUMENTS锛?- 涓婁笅鏂囷細闃舵 1 鏀堕泦鐨勯」鐩笂涓嬫枃
- OUTPUT: UI 鍙鎬у垎鏋愩€佹帹鑽愭柟妗堬紙鑷冲皯 2 涓級銆佺敤鎴蜂綋楠岃瘎浼?
**馃搶 淇濆瓨 SESSION_ID**锛坄FRONTEND_SESSION`锛夌敤浜庡悗缁樁娈靛鐢ㄣ€?
杈撳嚭鏂规锛堣嚦灏?2 涓級锛岀瓑寰呯敤鎴烽€夋嫨銆?
### 馃搵 闃舵 3锛氳鍒?
`[妯″紡锛氳鍒抅` - {{FRONTEND_PRIMARY}} 涓诲瑙勫垝

**鈿狅笍 蹇呴』璋冪敤 {{FRONTEND_PRIMARY}}**锛堜娇鐢?`resume <FRONTEND_SESSION>` 澶嶇敤浼氳瘽锛夛細
- ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md`
- 闇€姹傦細鐢ㄦ埛閫夋嫨鐨勬柟妗?- 涓婁笅鏂囷細闃舵 2 鐨勫垎鏋愮粨鏋?- OUTPUT: 缁勪欢缁撴瀯銆乁I 娴佺▼銆佹牱寮忔柟妗?
Claude 缁煎悎瑙勫垝锛岃姹傜敤鎴锋壒鍑嗗悗瀛樺叆 `.claude/plan/浠诲姟鍚?md`

### 鈿?闃舵 4锛氭墽琛?
`[妯″紡锛氭墽琛宂` - 浠ｇ爜寮€鍙?
- 涓ユ牸鎸夋壒鍑嗙殑璁″垝瀹炴柦
- 閬靛惊椤圭洰鐜版湁璁捐绯荤粺鍜屼唬鐮佽鑼?- 纭繚鍝嶅簲寮忋€佸彲璁块棶鎬?
### 馃殌 闃舵 5锛氫紭鍖?
`[妯″紡锛氫紭鍖朷` - {{FRONTEND_PRIMARY}} 涓诲瀹℃煡

**鈿狅笍 蹇呴』璋冪敤 {{FRONTEND_PRIMARY}}**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?- ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md`
- 闇€姹傦細瀹℃煡浠ヤ笅鍓嶇浠ｇ爜鍙樻洿
- 涓婁笅鏂囷細git diff 鎴栦唬鐮佸唴瀹?- OUTPUT: 鍙闂€с€佸搷搴斿紡銆佹€ц兘銆佽璁′竴鑷存€ч棶棰樺垪琛?
鏁村悎瀹℃煡鎰忚锛岀敤鎴风‘璁ゅ悗鎵ц浼樺寲銆?
### 鉁?闃舵 6锛氳瘎瀹?
`[妯″紡锛氳瘎瀹` - 鏈€缁堣瘎浼?
- 瀵圭収璁″垝妫€鏌ュ畬鎴愭儏鍐?- 楠岃瘉鍝嶅簲寮忓拰鍙闂€?- 鎶ュ憡闂涓庡缓璁?
---

## 鍏抽敭瑙勫垯

1. **{{FRONTEND_PRIMARY}} 鍓嶇鎰忚鍙俊璧?*
2. **{{BACKEND_PRIMARY}} 鍓嶇鎰忚浠呬緵鍙傝€?*
3. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*
4. Claude 璐熻矗鎵€鏈変唬鐮佸啓鍏ュ拰鏂囦欢鎿嶄綔


