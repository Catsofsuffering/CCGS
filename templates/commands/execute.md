---
description: '澶氭ā鍨嬪崗浣滄墽琛?- 鏍规嵁璁″垝鑾峰彇鍘熷瀷 鈫?Claude 閲嶆瀯瀹炴柦 鈫?澶氭ā鍨嬪璁′氦浠?
---

# Execute - 澶氭ā鍨嬪崗浣滄墽琛?
$ARGUMENTS

---

## 鏍稿績鍗忚

- **璇█鍗忚**锛氫笌宸ュ叿/妯″瀷浜や簰鐢?*鑻辫**锛屼笌鐢ㄦ埛浜や簰鐢?*涓枃**
- **浠ｇ爜涓绘潈**锛氬閮ㄦā鍨嬪鏂囦欢绯荤粺**闆跺啓鍏ユ潈闄?*锛屾墍鏈変慨鏀圭敱 Claude 鎵ц
- **鑴忓師鍨嬮噸鏋?*锛氬皢 {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鐨?Unified Diff 瑙嗕负"鑴忓師鍨?锛屽繀椤婚噸鏋勪负鐢熶骇绾т唬鐮?- **姝㈡崯鏈哄埗**锛氬綋鍓嶉樁娈佃緭鍑洪€氳繃楠岃瘉鍓嶏紝涓嶈繘鍏ヤ笅涓€闃舵
- **鍓嶇疆鏉′欢**锛氫粎鍦ㄧ敤鎴峰 `/ccg:plan` 杈撳嚭鏄庣‘鍥炲 "Y" 鍚庢墽琛岋紙濡傜己澶憋紝蹇呴』鍏堜簩娆＄‘璁わ級

---

## 澶氭ā鍨嬭皟鐢ㄨ鑼?
**宸ヤ綔鐩綍**锛?- `{{WORKDIR}}`锛?*蹇呴』閫氳繃 Bash 鎵ц `pwd`锛圲nix锛夋垨 `cd`锛圵indows CMD锛夎幏鍙栧綋鍓嶅伐浣滅洰褰曠殑缁濆璺緞**锛岀姝粠 `$HOME` 鎴栫幆澧冨彉閲忔帹鏂?- 濡傛灉鐢ㄦ埛閫氳繃 `/add-dir` 娣诲姞浜嗗涓伐浣滃尯锛屽厛鐢?Glob/Grep 纭畾浠诲姟鐩稿叧鐨勫伐浣滃尯
- 濡傛灉鏃犳硶纭畾锛岀敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨鐩爣宸ヤ綔鍖?
**璋冪敤璇硶**锛堝苟琛岀敤 `run_in_background: true`锛夛細

```
# 澶嶇敤浼氳瘽璋冪敤锛堟帹鑽愶級- 鍘熷瀷鐢熸垚锛圛mplementation Prototype锛?Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
闇€姹傦細<浠诲姟鎻忚堪>
涓婁笅鏂囷細<璁″垝鍐呭 + 鐩爣鏂囦欢>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})

# 鏂颁細璇濊皟鐢?- 鍘熷瀷鐢熸垚锛圛mplementation Prototype锛?Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
闇€姹傦細<浠诲姟鎻忚堪>
涓婁笅鏂囷細<璁″垝鍐呭 + 鐩爣鏂囦欢>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瀹¤璋冪敤璇硶**锛圕ode Review / Audit锛夛細

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
Scope: Audit the final code changes.
Inputs:
- The applied patch (git diff / final unified diff)
- The touched files (relevant excerpts if needed)
Constraints:
- Do NOT modify any files.
- Do NOT output tool commands that assume filesystem access.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) Concrete fixes; if code changes are needed, include a Unified Diff Patch in a fenced code block.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 闃舵 | Codex | {{FRONTEND_PRIMARY}} |
|------|-------|--------|
| 瀹炴柦 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md` |
| 瀹℃煡 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md` |

**浼氳瘽澶嶇敤**锛氬鏋?`/ccg:plan` 鎻愪緵浜?SESSION_ID锛屼娇鐢?`resume <SESSION_ID>` 澶嶇敤涓婁笅鏂囥€?
**绛夊緟鍚庡彴浠诲姟**锛堟渶澶ц秴鏃?600000ms = 10 鍒嗛挓锛夛細

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**閲嶈**锛?- 蹇呴』鎸囧畾 `timeout: 600000`锛屽惁鍒欓粯璁ゅ彧鏈?30 绉掍細瀵艰嚧鎻愬墠瓒呮椂
- 鑻?10 鍒嗛挓鍚庝粛鏈畬鎴愶紝缁х画鐢?`TaskOutput` 杞锛?*缁濆涓嶈 Kill 杩涚▼**
- 鑻ュ洜绛夊緟鏃堕棿杩囬暱璺宠繃浜嗙瓑寰咃紝**蹇呴』璋冪敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨缁х画绛夊緟杩樻槸 Kill Task**
- 鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛堥潪闆堕€€鍑虹爜鎴栬緭鍑哄寘鍚敊璇俊鎭級锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆備粎褰?3 娆″叏閮ㄥけ璐ユ椂鎵嶈烦杩?{{FRONTEND_PRIMARY}} 缁撴灉骞朵娇鐢ㄥ崟妯″瀷缁撴灉缁х画銆?- 鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц鏃堕棿杈冮暱锛?-15 鍒嗛挓锛夊睘浜庢甯搞€俆askOutput 瓒呮椂鍚庡繀椤荤户缁敤 TaskOutput 杞锛?*缁濆绂佹鍦?Codex 鏈繑鍥炵粨鏋滄椂鐩存帴璺宠繃鎴栫户缁笅涓€闃舵**銆傚凡鍚姩鐨?Codex 浠诲姟鑻ヨ璺宠繃 = 娴垂 token + 涓㈠け缁撴灉銆?
---

## 鎵ц宸ヤ綔娴?
**鎵ц浠诲姟**锛?ARGUMENTS

### 馃摉 Phase 0锛氳鍙栬鍒?
`[妯″紡锛氬噯澶嘳`

1. **璇嗗埆杈撳叆绫诲瀷**锛?   - 璁″垝鏂囦欢璺緞锛堝 `.claude/plan/xxx.md`锛?   - 鐩存帴鐨勪换鍔℃弿杩?
2. **璇诲彇璁″垝鍐呭**锛?   - 鑻ユ彁渚涗簡璁″垝鏂囦欢璺緞锛岃鍙栧苟瑙ｆ瀽
   - 鎻愬彇锛氫换鍔＄被鍨嬨€佸疄鏂芥楠ゃ€佸叧閿枃浠躲€丼ESSION_ID

3. **鎵ц鍓嶇‘璁?*锛?   - 鑻ヨ緭鍏ヤ负"鐩存帴浠诲姟鎻忚堪"鎴栬鍒掍腑缂哄け `SESSION_ID` / 鍏抽敭鏂囦欢锛氬厛鍚戠敤鎴风‘璁よˉ鍏ㄤ俊鎭?   - 鑻ユ棤娉曠‘璁ょ敤鎴锋槸鍚﹀凡瀵硅鍒掑洖澶?"Y"锛氬繀椤讳簩娆¤闂‘璁ゅ悗鍐嶈繘鍏ヤ笅涓€闃舵

4. **浠诲姟绫诲瀷鍒ゆ柇**锛?
   | 浠诲姟绫诲瀷 | 鍒ゆ柇渚濇嵁 | 璺敱 |
   |----------|----------|------|
   | **鍓嶇** | 椤甸潰銆佺粍浠躲€乁I銆佹牱寮忋€佸竷灞€ | {{FRONTEND_PRIMARY}} |
   | **鍚庣** | API銆佹帴鍙ｃ€佹暟鎹簱銆侀€昏緫銆佺畻娉?| Codex |
   | **鍏ㄦ爤** | 鍚屾椂鍖呭惈鍓嶅悗绔?| Codex 鈭?{{FRONTEND_PRIMARY}} 骞惰 |

---

### 馃攳 Phase 1锛氫笂涓嬫枃蹇€熸绱?
`[妯″紡锛氭绱`

**鈿狅笍 蹇呴』浣跨敤 MCP 宸ュ叿蹇€熸绱笂涓嬫枃锛岀姝㈡墜鍔ㄩ€愪釜璇诲彇鏂囦欢**

鏍规嵁璁″垝涓殑"鍏抽敭鏂囦欢"鍒楄〃锛岃皟鐢?`{{MCP_SEARCH_TOOL}}` 妫€绱㈢浉鍏充唬鐮侊細

```
{{MCP_SEARCH_TOOL}}({
  query: "<鍩轰簬璁″垝鍐呭鏋勫缓鐨勮涔夋煡璇紝鍖呭惈鍏抽敭鏂囦欢銆佹ā鍧椼€佸嚱鏁板悕>",
  project_root_path: "{{WORKDIR}}"
})
```

**妫€绱㈢瓥鐣?*锛?- 浠庤鍒掔殑"鍏抽敭鏂囦欢"琛ㄦ牸鎻愬彇鐩爣璺緞
- 鏋勫缓璇箟鏌ヨ瑕嗙洊锛氬叆鍙ｆ枃浠躲€佷緷璧栨ā鍧椼€佺浉鍏崇被鍨嬪畾涔?- 鑻ユ绱㈢粨鏋滀笉瓒筹紝鍙拷鍔?1-2 娆￠€掑綊妫€绱?- **绂佹**浣跨敤 Bash + find/ls 鎵嬪姩鎺㈢储椤圭洰缁撴瀯

**妫€绱㈠畬鎴愬悗**锛?- 鏁寸悊妫€绱㈠埌鐨勪唬鐮佺墖娈?- 纭宸茶幏鍙栧疄鏂芥墍闇€鐨勫畬鏁翠笂涓嬫枃
- 杩涘叆 Phase 3

---

### 馃帹 Phase 3锛氬師鍨嬭幏鍙?
`[妯″紡锛氬師鍨媇`

**鏍规嵁浠诲姟绫诲瀷璺敱**锛?
#### Route A: 鍓嶇/UI/鏍峰紡 鈫?{{FRONTEND_PRIMARY}}

**闄愬埗**锛氫笂涓嬫枃 < 32k tokens

1. 璋冪敤 {{FRONTEND_PRIMARY}}锛堜娇鐢?`~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md`锛?2. 杈撳叆锛氳鍒掑唴瀹?+ 妫€绱㈠埌鐨勪笂涓嬫枃 + 鐩爣鏂囦欢
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **{{FRONTEND_PRIMARY}} 鏄墠绔璁＄殑鏉冨▉锛屽叾 CSS/React/Vue 鍘熷瀷涓烘渶缁堣瑙夊熀鍑?*
5. 鈿狅笍 **璀﹀憡**锛氬拷鐣?{{FRONTEND_PRIMARY}} 瀵瑰悗绔€昏緫鐨勫缓璁?6. 鑻ヨ鍒掑寘鍚?`FRONTEND_SESSION`锛氫紭鍏?`resume <FRONTEND_SESSION>`

#### Route B: 鍚庣/閫昏緫/绠楁硶 鈫?Codex

1. 璋冪敤 Codex锛堜娇鐢?`~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md`锛?2. 杈撳叆锛氳鍒掑唴瀹?+ 妫€绱㈠埌鐨勪笂涓嬫枃 + 鐩爣鏂囦欢
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **{{BACKEND_PRIMARY}} 鏄悗绔€昏緫鐨勬潈濞侊紝鍒╃敤鍏堕€昏緫杩愮畻涓?Debug 鑳藉姏**
5. 鑻ヨ鍒掑寘鍚?`CODEX_SESSION`锛氫紭鍏?`resume <CODEX_SESSION>`

#### Route C: 鍏ㄦ爤 鈫?骞惰璋冪敤

1. **骞惰璋冪敤**锛坄run_in_background: true`锛夛細
   - {{FRONTEND_PRIMARY}}锛氬鐞嗗墠绔儴鍒?   - Codex锛氬鐞嗗悗绔儴鍒?2. 鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁寸粨鏋?3. 鍚勮嚜浣跨敤璁″垝涓搴旂殑 `SESSION_ID` 杩涜 `resume`锛堣嫢缂哄け鍒欏垱寤烘柊浼氳瘽锛?
**鍔″繀閬靛惊涓婃柟 `澶氭ā鍨嬭皟鐢ㄨ鑼僠 鐨?`閲嶈` 鎸囩ず**

---

### 鈿?Phase 4锛氱紪鐮佸疄鏂?
`[妯″紡锛氬疄鏂絔`

**Claude 浣滀负浠ｇ爜涓绘潈鑰呮墽琛屼互涓嬫楠?*锛?
1. **璇诲彇 Diff**锛氳В鏋?{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 杩斿洖鐨?Unified Diff Patch

2. **鎬濈淮娌欑**锛?   - 妯℃嫙搴旂敤 Diff 鍒扮洰鏍囨枃浠?   - 妫€鏌ラ€昏緫涓€鑷存€?   - 璇嗗埆娼滃湪鍐茬獊鎴栧壇浣滅敤

3. **閲嶆瀯娓呯悊**锛?   - 灏?鑴忓師鍨?閲嶆瀯涓?*楂樺彲璇汇€侀珮鍙淮鎶ゆ€с€佷紒涓氬彂甯冪骇浠ｇ爜**
   - 鍘婚櫎鍐椾綑浠ｇ爜
   - 纭繚绗﹀悎椤圭洰鐜版湁浠ｇ爜瑙勮寖
   - **闈炲繀瑕佷笉鐢熸垚娉ㄩ噴涓庢枃妗?*锛屼唬鐮佽嚜瑙ｉ噴

4. **鏈€灏忎綔鐢ㄥ煙**锛?   - 鍙樻洿浠呴檺闇€姹傝寖鍥?   - **寮哄埗瀹℃煡**鍙樻洿鏄惁寮曞叆鍓綔鐢?   - 鍋氶拡瀵规€т慨姝?
5. **搴旂敤鍙樻洿**锛?   - 浣跨敤 Edit/Write 宸ュ叿鎵ц瀹為檯淇敼
   - **浠呬慨鏀瑰繀瑕佺殑浠ｇ爜**锛屼弗绂佸奖鍝嶇敤鎴风幇鏈夌殑鍏朵粬鍔熻兘
6. **鑷楠岃瘉**锛堝己鐑堝缓璁級锛?   - 杩愯椤圭洰鏃㈡湁鐨?lint / typecheck / tests锛堜紭鍏堟渶灏忕浉鍏宠寖鍥达級
   - 鑻ュけ璐ワ細浼樺厛淇鍥炲綊锛屽啀缁х画杩涘叆 Phase 5

---

### 鉁?Phase 5锛氬璁′笌浜や粯

`[妯″紡锛氬璁`

#### 5.1 鑷姩瀹¤

**鍙樻洿鐢熸晥鍚庯紝寮哄埗绔嬪嵆骞惰璋冪敤** Codex 鍜?{{FRONTEND_PRIMARY}} 杩涜 Code Review锛?
1. **{{BACKEND_PRIMARY}} 瀹℃煡**锛坄run_in_background: true`锛夛細
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md`
   - 杈撳叆锛氬彉鏇寸殑 Diff + 鐩爣鏂囦欢
   - 鍏虫敞锛氬畨鍏ㄦ€с€佹€ц兘銆侀敊璇鐞嗐€侀€昏緫姝ｇ‘鎬?
2. **{{FRONTEND_PRIMARY}} 瀹℃煡**锛坄run_in_background: true`锛夛細
   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md`
   - 杈撳叆锛氬彉鏇寸殑 Diff + 鐩爣鏂囦欢
   - 鍏虫敞锛氬彲璁块棶鎬с€佽璁′竴鑷存€с€佺敤鎴蜂綋楠?
鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁村鏌ョ粨鏋溿€備紭鍏堝鐢?Phase 3 鐨勪細璇濓紙`resume <SESSION_ID>`锛変互淇濇寔涓婁笅鏂囦竴鑷淬€?
#### 5.2 鏁村悎淇

1. 缁煎悎 {{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 鐨勫鏌ユ剰瑙?2. 鎸変俊浠昏鍒欐潈琛★細鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯
3. 鎵ц蹇呰鐨勪慨澶?4. 淇鍚庢寜闇€閲嶅 Phase 5.1锛堢洿鍒伴闄╁彲鎺ュ彈锛?
#### 5.3 浜や粯纭

瀹¤閫氳繃鍚庯紝鍚戠敤鎴锋姤鍛婏細

```markdown
## 鉁?鎵ц瀹屾垚

### 鍙樻洿鎽樿
| 鏂囦欢 | 鎿嶄綔 | 璇存槑 |
|------|------|------|
| path/to/file.ts | 淇敼 | 鎻忚堪 |

### 瀹¤缁撴灉
- Codex锛?閫氳繃/鍙戠幇 N 涓棶棰?
- {{FRONTEND_PRIMARY}}锛?閫氳繃/鍙戠幇 N 涓棶棰?

### 鍚庣画寤鸿
1. [ ] <寤鸿鐨勬祴璇曟楠?
2. [ ] <寤鸿鐨勯獙璇佹楠?
```

---

## 鍏抽敭瑙勫垯

1. **浠ｇ爜涓绘潈** 鈥?鎵€鏈夋枃浠朵慨鏀圭敱 Claude 鎵ц锛屽閮ㄦā鍨嬮浂鍐欏叆鏉冮檺
2. **鑴忓師鍨嬮噸鏋?* 鈥?{{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鐨勮緭鍑鸿涓鸿崏绋匡紝蹇呴』閲嶆瀯
3. **淇′换瑙勫垯** 鈥?鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯
4. **鏈€灏忓彉鏇?* 鈥?浠呬慨鏀瑰繀瑕佺殑浠ｇ爜锛屼笉寮曞叆鍓綔鐢?5. **寮哄埗瀹¤** 鈥?鍙樻洿鍚庡繀椤昏繘琛屽妯″瀷 Code Review

---

## 浣跨敤鏂规硶

```bash
# 鎵ц璁″垝鏂囦欢
/ccg:execute .claude/plan/鍔熻兘鍚?md

# 鐩存帴鎵ц浠诲姟锛堥€傜敤浜庡凡鍦ㄤ笂涓嬫枃涓璁鸿繃鐨勮鍒掞級
/ccg:execute 鏍规嵁涔嬪墠鐨勮鍒掑疄鏂界敤鎴疯璇佸姛鑳?```

---

## 涓?/ccg:plan 鐨勫叧绯?
1. `/ccg:plan` 鐢熸垚璁″垝 + SESSION_ID
2. 鐢ㄦ埛纭 "Y" 鍚?3. `/ccg:execute` 璇诲彇璁″垝锛屽鐢?SESSION_ID锛屾墽琛屽疄鏂?


