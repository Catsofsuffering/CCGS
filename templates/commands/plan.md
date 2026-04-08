---
description: '澶氭ā鍨嬪崗浣滆鍒?- 涓婁笅鏂囨绱?+ 鍙屾ā鍨嬪垎鏋?鈫?鐢熸垚 Step-by-step 瀹炴柦璁″垝'
---

# Plan - 澶氭ā鍨嬪崗浣滆鍒?
$ARGUMENTS

---

## 鏍稿績鍗忚

- **璇█鍗忚**锛氫笌宸ュ叿/妯″瀷浜や簰鐢?*鑻辫**锛屼笌鐢ㄦ埛浜や簰鐢?*涓枃**
- **寮哄埗骞惰**锛欳odex/{{FRONTEND_PRIMARY}} 璋冪敤蹇呴』浣跨敤 `run_in_background: true`锛堝寘鍚崟妯″瀷璋冪敤锛岄伩鍏嶉樆濉炰富绾跨▼锛?- **浠ｇ爜涓绘潈**锛氬閮ㄦā鍨嬪鏂囦欢绯荤粺**闆跺啓鍏ユ潈闄?*锛屾墍鏈変慨鏀圭敱 Claude 鎵ц
- **姝㈡崯鏈哄埗**锛氬綋鍓嶉樁娈佃緭鍑洪€氳繃楠岃瘉鍓嶏紝涓嶈繘鍏ヤ笅涓€闃舵
- **浠呰鍒?*锛氭湰鍛戒护鍏佽璇诲彇涓婁笅鏂囦笌鍐欏叆 `.claude/plan/*` 璁″垝鏂囦欢锛屼絾**绂佹淇敼浜у搧浠ｇ爜**

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
闇€姹傦細<澧炲己鍚庣殑闇€姹?
涓婁笅鏂囷細<妫€绱㈠埌鐨勯」鐩笂涓嬫枃>
</TASK>
OUTPUT: Step-by-step implementation plan with pseudo-code. DO NOT modify any files.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 闃舵 | Codex | {{FRONTEND_PRIMARY}} |
|------|-------|--------|
| 鍒嗘瀽 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md` |
| 瑙勫垝 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md` |

**浼氳瘽澶嶇敤**锛氭瘡娆¤皟鐢ㄨ繑鍥?`SESSION_ID: xxx`锛堥€氬父鐢?wrapper 杈撳嚭锛夛紝**蹇呴』淇濆瓨**浠ヤ緵鍚庣画 `/ccg:execute` 浣跨敤銆?
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
**瑙勫垝浠诲姟**锛?ARGUMENTS

### 馃攳 Phase 1锛氫笂涓嬫枃鍏ㄩ噺妫€绱?
`[妯″紡锛氱爺绌禲`

#### 1.1 Prompt 澧炲己锛堝繀椤婚鍏堟墽琛岋級

**Prompt 澧炲己**锛堟寜 `/ccg:enhance` 鐨勯€昏緫鎵ц锛夛細鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁撅紝琛ュ叏涓虹粨鏋勫寲闇€姹傦紙鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗭級锛?*鐢ㄥ寮虹粨鏋滄浛浠ｅ師濮?$ARGUMENTS** 鐢ㄤ簬鍚庣画鎵€鏈夐樁娈点€?
#### 1.2 涓婁笅鏂囨绱?
**璋冪敤 `{{MCP_SEARCH_TOOL}}` 宸ュ叿**锛?
```
{{MCP_SEARCH_TOOL}}({
  query: "<鍩轰簬澧炲己鍚庨渶姹傛瀯寤虹殑璇箟鏌ヨ>",
  project_root_path: "{{WORKDIR}}"
})
```

- 浣跨敤鑷劧璇█鏋勫缓璇箟鏌ヨ锛圵here/What/How锛?- **绂佹鍩轰簬鍋囪鍥炵瓟**
- 鑻?MCP 涓嶅彲鐢細鍥為€€鍒?Glob + Grep 杩涜鏂囦欢鍙戠幇涓庡叧閿鍙峰畾浣?
#### 1.3 瀹屾暣鎬ф鏌?
- 蹇呴』鑾峰彇鐩稿叧绫汇€佸嚱鏁般€佸彉閲忕殑**瀹屾暣瀹氫箟涓庣鍚?*
- 鑻ヤ笂涓嬫枃涓嶈冻锛岃Е鍙?*閫掑綊妫€绱?*
- 浼樺厛杈撳嚭锛氬叆鍙ｆ枃浠?+ 琛屽彿 + 鍏抽敭绗﹀彿鍚嶏紱蹇呰鏃惰ˉ鍏呮渶灏忎唬鐮佺墖娈碉紙浠呯敤浜庢秷闄ゆ涔夛級

#### 1.4 闇€姹傚榻?
- 鑻ラ渶姹備粛鏈夋ā绯婄┖闂达紝**蹇呴』**鍚戠敤鎴疯緭鍑哄紩瀵兼€ч棶棰樺垪琛?- 鐩磋嚦闇€姹傝竟鐣屾竻鏅帮紙鏃犻仐婕忋€佹棤鍐椾綑锛?
### 馃挕 Phase 2锛氬妯″瀷鍗忎綔鍒嗘瀽

`[妯″紡锛氬垎鏋怾`

#### 2.1 鍒嗗彂杈撳叆

**骞惰璋冪敤** Codex 鍜?{{FRONTEND_PRIMARY}}锛坄run_in_background: true`锛夛細

灏?*鍘熷闇€姹?*锛堜笉甯﹂璁捐鐐癸級鍒嗗彂缁欎袱涓ā鍨嬶細

1. **{{BACKEND_PRIMARY}} 鍚庣鍒嗘瀽**锛?   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md`
   - 鍏虫敞锛氭妧鏈彲琛屾€с€佹灦鏋勫奖鍝嶃€佹€ц兘鑰冮噺銆佹綔鍦ㄩ闄?   - OUTPUT: 澶氳搴﹁В鍐虫柟妗?+ 浼樺姡鍔垮垎鏋?
2. **{{FRONTEND_PRIMARY}} 鍓嶇鍒嗘瀽**锛?   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md`
   - 鍏虫敞锛歎I/UX 褰卞搷銆佺敤鎴蜂綋楠屻€佽瑙夎璁?   - OUTPUT: 澶氳搴﹁В鍐虫柟妗?+ 浼樺姡鍔垮垎鏋?
鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁寸粨鏋溿€?*馃搶 淇濆瓨 SESSION_ID**锛坄CODEX_SESSION` 鍜?`FRONTEND_SESSION`锛夈€?
#### 2.2 浜ゅ弶楠岃瘉

鏁村悎鍚勬柟鎬濊矾锛岃繘琛岃凯浠ｄ紭鍖栵細

1. **璇嗗埆涓€鑷磋鐐?*锛堝己淇″彿锛?2. **璇嗗埆鍒嗘鐐?*锛堥渶鏉冭　锛?3. **浜掕ˉ浼樺娍**锛氬悗绔€昏緫浠?Codex 涓哄噯锛屽墠绔璁′互 {{FRONTEND_PRIMARY}} 涓哄噯
4. **閫昏緫鎺ㄦ紨**锛氭秷闄ゆ柟妗堜腑鐨勯€昏緫婕忔礊

#### 2.3锛堝彲閫変絾鎺ㄨ崘锛夊弻妯″瀷浜у嚭鈥滆鍒掕崏妗堚€?
涓洪檷浣?Claude 鍚堟垚璁″垝鐨勯仐婕忛闄╋紝鍙苟琛岃涓や釜妯″瀷杈撳嚭鈥滆鍒掕崏妗堚€濓紙浠嶇劧**涓嶅厑璁?*淇敼鏂囦欢锛夛細

1. **{{BACKEND_PRIMARY}} 璁″垝鑽夋**锛堝悗绔潈濞侊級锛?   - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code锛堥噸鐐癸細鏁版嵁娴?杈圭晫鏉′欢/閿欒澶勭悊/娴嬭瘯绛栫暐锛?
2. **{{FRONTEND_PRIMARY}} 璁″垝鑽夋**锛堝墠绔潈濞侊級锛?   - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code锛堥噸鐐癸細淇℃伅鏋舵瀯/浜や簰/鍙闂€?瑙嗚涓€鑷存€э級

鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁寸粨鏋滐紝骞惰褰曞叾寤鸿鐨勫叧閿樊寮傜偣銆?
#### 2.4 鐢熸垚瀹炴柦璁″垝锛圕laude 鏈€缁堢増锛?
缁煎悎鍙屾柟鍒嗘瀽锛岀敓鎴?**Step-by-step 瀹炴柦璁″垝**锛?
```markdown
## 馃搵 瀹炴柦璁″垝锛?浠诲姟鍚嶇О>

### 浠诲姟绫诲瀷
- [ ] 鍓嶇 (鈫?{{FRONTEND_PRIMARY}})
- [ ] 鍚庣 (鈫?Codex)
- [ ] 鍏ㄦ爤 (鈫?骞惰)

### 鎶€鏈柟妗?<缁煎悎 {{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 鍒嗘瀽鐨勬渶浼樻柟妗?

### 瀹炴柦姝ラ
1. <姝ラ 1> - 棰勬湡浜х墿
2. <姝ラ 2> - 棰勬湡浜х墿
...

### 鍏抽敭鏂囦欢
| 鏂囦欢 | 鎿嶄綔 | 璇存槑 |
|------|------|------|
| path/to/file.ts:L10-L50 | 淇敼 | 鎻忚堪 |

### 椋庨櫓涓庣紦瑙?| 椋庨櫓 | 缂撹В鎺柦 |
|------|----------|

### SESSION_ID锛堜緵 /ccg:execute 浣跨敤锛?- CODEX_SESSION: <session_id>
- FRONTEND_SESSION: <session_id>
```

### 鉀?Phase 2 缁撴潫锛氳鍒掍氦浠橈紙闈炴墽琛岋級

**`/ccg:plan` 鐨勮亴璐ｅ埌姝ょ粨鏉燂紝蹇呴』鎵ц浠ヤ笅鍔ㄤ綔**锛?
1. 鍚戠敤鎴峰睍绀哄畬鏁村疄鏂借鍒掞紙鍚吉浠ｇ爜锛?2. 灏嗚鍒掍繚瀛樿嚦 `.claude/plan/<鍔熻兘鍚?.md`锛堝姛鑳藉悕浠庨渶姹備腑鎻愬彇锛屽 `user-auth`銆乣payment-module` 绛夛級
3. 浠?*鍔犵矖鏂囨湰**杈撳嚭鎻愮ず锛堝繀椤讳娇鐢ㄥ疄闄呬繚瀛樼殑鏂囦欢璺緞锛夛細

   ---
   **馃搵 璁″垝宸茬敓鎴愬苟淇濆瓨鑷?`.claude/plan/瀹為檯鍔熻兘鍚?md`**

   **璇峰鏌ヤ笂杩拌鍒掞紝鎮ㄥ彲浠ワ細**
   - 馃敡 **淇敼璁″垝**锛氬憡璇夋垜闇€瑕佽皟鏁寸殑閮ㄥ垎锛屾垜浼氭洿鏂拌鍒?   - 鈻讹笍 **鎵ц璁″垝**锛氬鍒朵互涓嬪懡浠ゅ埌鏂颁細璇濇墽琛?
   ```
   /ccg:execute .claude/plan/瀹為檯鍔熻兘鍚?md
   ```
   ---

   **鈿狅笍 娉ㄦ剰**锛氫笂闈㈢殑 `瀹為檯鍔熻兘鍚?md` 蹇呴』鏇挎崲涓轰綘瀹為檯淇濆瓨鐨勬枃浠跺悕锛?
4. **绔嬪嵆缁堟褰撳墠鍥炲**锛圫top here. No more tool calls.锛?
**鈿狅笍 缁濆绂佹**锛?- 鉂?闂敤鎴?"Y/N" 鐒跺悗鑷姩鎵ц锛堟墽琛屾槸 `/ccg:execute` 鐨勮亴璐ｏ級
- 鉂?瀵逛骇鍝佷唬鐮佽繘琛屼换浣曞啓鎿嶄綔
- 鉂?鑷姩璋冪敤 `/ccg:execute` 鎴栦换浣曞疄鏂藉姩浣?- 鉂?鍦ㄧ敤鎴锋湭鏄庣‘瑕佹眰淇敼鏃剁户缁Е鍙戞ā鍨嬭皟鐢?
---

## 璁″垝淇濆瓨

瑙勫垝瀹屾垚鍚庯紝灏嗚鍒掍繚瀛樿嚦锛?
- **棣栨瑙勫垝**锛歚.claude/plan/<鍔熻兘鍚?.md`
- **杩唬鐗堟湰**锛歚.claude/plan/<鍔熻兘鍚?-v2.md`銆乣.claude/plan/<鍔熻兘鍚?-v3.md`...

璁″垝鏂囦欢鍐欏叆搴斿湪鍚戠敤鎴峰睍绀鸿鍒掑墠瀹屾垚銆?
---

## 璁″垝淇敼娴佺▼

濡傛灉鐢ㄦ埛瑕佹眰淇敼璁″垝锛?
1. 鏍规嵁鐢ㄦ埛鍙嶉璋冩暣璁″垝鍐呭
2. 鏇存柊 `.claude/plan/<鍔熻兘鍚?.md` 鏂囦欢
3. 閲嶆柊灞曠ず淇敼鍚庣殑璁″垝
4. 鍐嶆鎻愮ず鐢ㄦ埛瀹℃煡鎴栨墽琛?
---

## 鍚庣画姝ラ

鐢ㄦ埛瀹℃煡婊℃剰鍚庯紝**鎵嬪姩**鎵ц锛?
```bash
/ccg:execute .claude/plan/<鍔熻兘鍚?.md
```

---

## 鍏抽敭瑙勫垯

1. **浠呰鍒掍笉瀹炴柦** 鈥?鏈懡浠や笉鎵ц浠讳綍浠ｇ爜鍙樻洿
2. **涓嶉棶 Y/N** 鈥?鍙睍绀鸿鍒掞紝璁╃敤鎴峰喅瀹氫笅涓€姝?3. **淇′换瑙勫垯** 鈥?鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯
4. 澶栭儴妯″瀷瀵规枃浠剁郴缁?*闆跺啓鍏ユ潈闄?*
5. **SESSION_ID 浜ゆ帴** 鈥?璁″垝鏈熬蹇呴』鍖呭惈 `CODEX_SESSION` / `FRONTEND_SESSION`锛堜緵 `/ccg:execute resume <SESSION_ID>` 浣跨敤锛?


