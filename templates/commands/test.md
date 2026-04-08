---
description: '澶氭ā鍨嬫祴璇曠敓鎴愶細鏅鸿兘璺敱 {{BACKEND_PRIMARY}} 鍚庣娴嬭瘯 / {{FRONTEND_PRIMARY}} 鍓嶇娴嬭瘯'
---

# Test - 澶氭ā鍨嬫祴璇曠敓鎴?
鏍规嵁浠ｇ爜绫诲瀷鏅鸿兘璺敱锛岀敓鎴愰珮璐ㄩ噺娴嬭瘯鐢ㄤ緥銆?
## 浣跨敤鏂规硶

```bash
/test <娴嬭瘯鐩爣>
```

## 涓婁笅鏂?
- 娴嬭瘯鐩爣锛?ARGUMENTS
- 鏅鸿兘璺敱锛氬悗绔?鈫?{{BACKEND_PRIMARY}}锛屽墠绔?鈫?{{FRONTEND_PRIMARY}}锛屽叏鏍?鈫?骞惰
- 閬靛惊椤圭洰鐜版湁娴嬭瘯妗嗘灦鍜岄鏍?
## 浣犵殑瑙掕壊

浣犳槸**娴嬭瘯宸ョ▼甯?*锛岀紪鎺掓祴璇曠敓鎴愭祦绋嬶細
- **{{BACKEND_PRIMARY}}** 鈥?鍚庣娴嬭瘯鐢熸垚锛?*鍚庣鏉冨▉**锛?- **{{FRONTEND_PRIMARY}}** 鈥?鍓嶇娴嬭瘯鐢熸垚锛?*鍓嶇鏉冨▉**锛?- **Claude (鑷繁)** 鈥?鏁村悎娴嬭瘯銆侀獙璇佽繍琛?
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
闇€姹傦細涓轰互涓嬩唬鐮佺敓鎴愭祴璇?<浠ｇ爜鍐呭>
闇€姹傛弿杩帮細<澧炲己鍚庣殑闇€姹傦紙濡傛湭澧炲己鍒欑敤 $ARGUMENTS锛?
瑕佹眰锛?1. 浣跨敤椤圭洰鐜版湁娴嬭瘯妗嗘灦
2. 瑕嗙洊姝ｅ父璺緞銆佽竟鐣屾潯浠躲€佸紓甯稿鐞?</TASK>
OUTPUT: 瀹屾暣娴嬭瘯浠ｇ爜
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 妯″瀷 | 鎻愮ず璇?|
|------|--------|
| Codex | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/tester.md` |
| {{FRONTEND_PRIMARY}} | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/tester.md` |

**鏅鸿兘璺敱**锛?
| 浠ｇ爜绫诲瀷 | 璺敱 |
|---------|------|
| 鍚庣 | {{BACKEND_PRIMARY}} |
| 鍓嶇 | {{FRONTEND_PRIMARY}} |
| 鍏ㄦ爤 | 骞惰鎵ц涓よ€?|

**骞惰璋冪敤**锛氫娇鐢?`run_in_background: true` 鍚姩锛岀敤 `TaskOutput` 绛夊緟缁撴灉銆?*蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**绛夊緟鍚庡彴浠诲姟**锛堜娇鐢ㄦ渶澶ц秴鏃?600000ms = 10 鍒嗛挓锛夛細

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**閲嶈**锛?- 蹇呴』鎸囧畾 `timeout: 600000`锛屽惁鍒欓粯璁ゅ彧鏈?30 绉掍細瀵艰嚧鎻愬墠瓒呮椂銆?濡傛灉 10 鍒嗛挓鍚庝粛鏈畬鎴愶紝缁х画鐢?`TaskOutput` 杞锛?*缁濆涓嶈 Kill 杩涚▼**銆?- 鑻ュ洜绛夊緟鏃堕棿杩囬暱璺宠繃浜嗙瓑寰?TaskOutput 缁撴灉锛屽垯**蹇呴』璋冪敤 `AskUserQuestion` 宸ュ叿璇㈤棶鐢ㄦ埛閫夋嫨缁х画绛夊緟杩樻槸 Kill Task銆傜姝㈢洿鎺?Kill Task銆?*
- 鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶈烦杩?{{FRONTEND_PRIMARY}} 缁撴灉骞朵娇鐢ㄥ崟妯″瀷缁撴灉缁х画銆?- 鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц鏃堕棿杈冮暱锛?-15 鍒嗛挓锛夊睘浜庢甯搞€俆askOutput 瓒呮椂鍚庡繀椤荤户缁敤 TaskOutput 杞锛?*缁濆绂佹鍦?Codex 鏈繑鍥炵粨鏋滄椂鐩存帴璺宠繃鎴栫户缁笅涓€闃舵**銆傚凡鍚姩鐨?Codex 浠诲姟鑻ヨ璺宠繃 = 娴垂 token + 涓㈠け缁撴灉銆?
---

## 鎵ц宸ヤ綔娴?
**娴嬭瘯鐩爣**锛?ARGUMENTS

### 馃攳 闃舵 0锛歅rompt 澧炲己锛堝彲閫夛級

`[妯″紡锛氬噯澶嘳` - **Prompt 澧炲己**锛堟寜 `/ccg:enhance` 鐨勯€昏緫鎵ц锛夛細鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁撅紝琛ュ叏涓虹粨鏋勫寲闇€姹傦紙鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗭級锛?*鐢ㄥ寮虹粨鏋滄浛浠ｅ師濮?$ARGUMENTS锛屽悗缁皟鐢?{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鏃朵紶鍏ュ寮哄悗鐨勯渶姹?*

### 馃攳 闃舵 1锛氭祴璇曞垎鏋?
`[妯″紡锛氱爺绌禲`

1. 妫€绱㈢洰鏍囦唬鐮佺殑瀹屾暣瀹炵幇
2. 鏌ユ壘鐜版湁娴嬭瘯鏂囦欢鍜屾祴璇曟鏋堕厤缃?3. 璇嗗埆浠ｇ爜绫诲瀷锛歔鍚庣/鍓嶇/鍏ㄦ爤]
4. 璇勪及褰撳墠娴嬭瘯瑕嗙洊鐜囧拰缂哄彛

### 馃敩 闃舵 2锛氭櫤鑳借矾鐢辨祴璇曠敓鎴?
`[妯″紡锛氱敓鎴怾`

**鈿狅笍 鏍规嵁浠ｇ爜绫诲瀷蹇呴』璋冪敤瀵瑰簲妯″瀷**锛堝弬鐓т笂鏂硅皟鐢ㄨ鑼冿級锛?
- **鍚庣浠ｇ爜** 鈫?`Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: false })`
  - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/tester.md`
- **鍓嶇浠ｇ爜** 鈫?`Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: false })`
  - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/tester.md`
- **鍏ㄦ爤浠ｇ爜** 鈫?骞惰璋冪敤涓よ€咃細
  1. `Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
     - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/tester.md`
  2. `Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
     - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/tester.md`
  鐢?`TaskOutput` 绛夊緟缁撴灉

OUTPUT锛氬畬鏁存祴璇曚唬鐮侊紙浣跨敤椤圭洰鐜版湁娴嬭瘯妗嗘灦锛岃鐩栨甯歌矾寰勩€佽竟鐣屾潯浠躲€佸紓甯稿鐞嗭級

**蹇呴』绛夋墍鏈夋ā鍨嬭繑鍥炲悗鎵嶈兘杩涘叆涓嬩竴闃舵**銆?
**鍔″繀閬靛惊涓婃柟 `澶氭ā鍨嬭皟鐢ㄨ鑼僠 鐨?`閲嶈` 鎸囩ず**

### 馃攢 闃舵 3锛氭祴璇曟暣鍚?
`[妯″紡锛氳鍒抅`

1. 鏀堕泦妯″瀷杈撳嚭
2. Claude 閲嶆瀯锛氱粺涓€椋庢牸銆佺‘淇濆懡鍚嶄竴鑷淬€佷紭鍖栫粨鏋勩€佺Щ闄ゅ啑浣?
### 鉁?闃舵 4锛氭祴璇曢獙璇?
`[妯″紡锛氭墽琛宂`

1. 鍒涘缓娴嬭瘯鏂囦欢
2. 杩愯鐢熸垚鐨勬祴璇?3. 濡傛湁澶辫触锛屽垎鏋愬師鍥犲苟淇

---

## 杈撳嚭鏍煎紡

```markdown
## 馃И 娴嬭瘯鐢熸垚锛?娴嬭瘯鐩爣>

### 鍒嗘瀽缁撴灉
- 浠ｇ爜绫诲瀷锛歔鍚庣/鍓嶇/鍏ㄦ爤]
- 娴嬭瘯妗嗘灦锛?妫€娴嬪埌鐨勬鏋?

### 鐢熸垚鐨勬祴璇?- 娴嬭瘯鏂囦欢锛?鏂囦欢璺緞>
- 娴嬭瘯鐢ㄤ緥鏁帮細<鏁伴噺>

### 杩愯缁撴灉
- 閫氳繃锛歑 / Y
- 澶辫触锛?濡傛湁锛屽垪鍑哄師鍥?
```

## 娴嬭瘯绛栫暐閲戝瓧濉?
```
    /\      E2E (10%)
   /--\     Integration (20%)
  /----\    Unit (70%)
```

---

## 鍏抽敭瑙勫垯

1. **娴嬭瘯琛屼负锛屼笉娴嬭瘯瀹炵幇** 鈥?鍏虫敞杈撳叆杈撳嚭
2. **鏅鸿兘璺敱** 鈥?鍚庣娴嬭瘯鐢?Codex锛屽墠绔祴璇曠敤 {{FRONTEND_PRIMARY}}
3. **澶嶇敤鐜版湁妯″紡** 鈥?閬靛惊椤圭洰宸叉湁鐨勬祴璇曢鏍?4. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*


