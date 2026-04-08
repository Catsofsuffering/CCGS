---
description: '{{BACKEND_PRIMARY}} 鍏ㄦ潈鎵ц璁″垝 - 璇诲彇 /ccg:plan 浜у嚭鐨勮鍒掓枃浠讹紝{{BACKEND_PRIMARY}} 鎵挎媴 MCP 鎼滅储 + 浠ｇ爜瀹炵幇 + 娴嬭瘯锛屽妯″瀷瀹℃牳'
---

# Codex-Exec - Codex 鍏ㄦ潈鎵ц璁″垝

$ARGUMENTS

---

## 鏍稿績鐞嗗康

**涓?`/ccg:plan` 閰嶅浣跨敤**锛?
```
/ccg:plan 鈫?澶氭ā鍨嬪崗鍚岃鍒掞紙Codex 鈭?{{FRONTEND_PRIMARY}} 鍒嗘瀽 鈫?Claude 缁煎悎锛?                鈫?璁″垝鏂囦欢 (.claude/plan/xxx.md)
/ccg:codex-exec 鈫?Codex 鍏ㄦ潈鎵ц锛圡CP 鎼滅储 + 浠ｇ爜瀹炵幇 + 娴嬭瘯锛?                鈫?浠ｇ爜鍙樻洿
                鈫?澶氭ā鍨嬪鏍革紙Codex 鈭?{{FRONTEND_PRIMARY}} 浜ゅ弶瀹℃煡锛?```

**涓?`/ccg:execute` 鐨勫尯鍒?*锛?
| 缁村害 | `/ccg:execute` | `/ccg:codex-exec` |
|------|---------------|-------------------|
| 浠ｇ爜瀹炵幇 | Claude 閲嶆瀯 {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鐨?Diff | **{{BACKEND_PRIMARY}} 鐩存帴瀹炵幇** |
| MCP 鎼滅储 | Claude 璋冪敤 MCP | **{{BACKEND_PRIMARY}} 璋冪敤 MCP** |
| Claude 涓婁笅鏂?| 楂橈紙鎼滅储缁撴灉 + 浠ｇ爜鍏ㄨ繘鏉ワ級 | **鏋佷綆锛堝彧鐪嬫憳瑕?+ diff锛?* |
| Claude token | 澶ч噺娑堣€?| **鏋佸皯娑堣€?* |
| 瀹℃牳 | 澶氭ā鍨嬪鏌?| **澶氭ā鍨嬪鏌ワ紙涓嶅彉锛?* |

---

## 璇█鍗忚

- 涓庡伐鍏?妯″瀷浜や簰鐢?**鑻辫**
- 涓庣敤鎴蜂氦浜掔敤 **涓枃**

---

## 澶氭ā鍨嬭皟鐢ㄨ鑼?
**宸ヤ綔鐩綍**锛?- `{{WORKDIR}}`锛?*蹇呴』閫氳繃 Bash 鎵ц `pwd`锛圲nix锛夋垨 `cd`锛圵indows CMD锛夎幏鍙栧綋鍓嶅伐浣滅洰褰曠殑缁濆璺緞**锛岀姝粠 `$HOME` 鎴栫幆澧冨彉閲忔帹鏂?- 濡傛灉鐢ㄦ埛閫氳繃 `/add-dir` 娣诲姞浜嗗涓伐浣滃尯锛屽厛鐢?Glob/Grep 纭畾浠诲姟鐩稿叧鐨勫伐浣滃尯
- 濡傛灉鏃犳硶纭畾锛岀敤 `AskUserQuestion` 璇㈤棶鐢ㄦ埛閫夋嫨鐩爣宸ヤ綔鍖?
**{{BACKEND_PRIMARY}} 鎵ц璋冪敤璇硶**锛?
```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
<鎸囦护鍐呭>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**{{BACKEND_PRIMARY}} 澶嶇敤浼氳瘽璋冪敤**锛?
```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
<鎸囦护鍐呭>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瀹℃牳璋冪敤璇硶**锛圕odex 鈭?{{FRONTEND_PRIMARY}} 骞惰瀹℃煡锛夛細

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'REVIEW_EOF'
ROLE_FILE: <瑙掕壊鎻愮ず璇嶈矾寰?
<TASK>
Scope: Audit the code changes made by Codex.
Inputs:
- The git diff (applied changes)
- The implementation plan
Constraints:
- Do NOT modify any files.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) If code changes are needed, include a Unified Diff Patch in a fenced code block.
REVIEW_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "绠€鐭弿杩?
})
```

**瑙掕壊鎻愮ず璇?*锛?
| 闃舵 | Codex | {{FRONTEND_PRIMARY}} |
|------|-------|--------|
| 瀹℃煡 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md` |

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

1. **璇嗗埆杈撳叆绫诲瀷**锛?   - 璁″垝鏂囦欢璺緞锛堝 `.claude/plan/xxx.md`锛夆啋 璇诲彇骞惰В鏋?   - 鐩存帴鐨勪换鍔℃弿杩?鈫?鎻愮ず鐢ㄦ埛鍏堟墽琛?`/ccg:plan`

2. **瑙ｆ瀽璁″垝鍐呭**锛屾彁鍙栵細
   - 浠诲姟绫诲瀷锛堝墠绔?鍚庣/鍏ㄦ爤锛?   - 鎶€鏈柟妗?   - 瀹炴柦姝ラ
   - 鍏抽敭鏂囦欢鍒楄〃
   - SESSION_ID锛坄CODEX_SESSION` / `FRONTEND_SESSION`锛?
3. **鎵ц鍓嶇‘璁?*锛?   鍚戠敤鎴峰睍绀鸿鍒掓憳瑕侊紝纭鍚庢墽琛岋細

   ```markdown
   ## 鍗冲皢鎵ц

   **浠诲姟**锛?璁″垝鏍囬>
   **妯″紡**锛欳odex 鍏ㄦ潈鎵ц
   **姝ラ**锛?N 姝?
   **鍏抽敭鏂囦欢**锛?N 涓?

   Codex 灏嗚嚜涓诲畬鎴愶細MCP 鎼滅储 + 浠ｇ爜瀹炵幇 + 娴嬭瘯楠岃瘉
   Claude 浠呭仛鏈€缁堝鏍?
   纭鎵ц锛?Y/N)
   ```

---

### 鈿?Phase 1锛欳odex 鍏ㄦ潈鎵ц

`[妯″紡锛氭墽琛宂`

**灏嗚鍒掕浆鍖栦负 Codex 缁撴瀯鍖栨寚浠わ紝涓€娆℃€т笅鍙?*锛?
```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <CODEX_SESSION> - \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
You are a full-stack execution agent. Implement the following plan end-to-end.

## Implementation Plan
<灏?Phase 0 瑙ｆ瀽鍑虹殑瀹屾暣璁″垝鍐呭绮樿创浜庢>

## Your Instructions

### Step 1: Context Verification
Before coding, verify you have sufficient context:
- Use ace-tool MCP (search_context) to search for relevant existing code patterns
- Read the key files listed in the plan to understand current implementation
- If the plan references external libraries/APIs, use context7 MCP to query their latest documentation
- If latest information is needed, use grok-search MCP for web search

### Step 2: Implementation
Implement each step from the plan in order:
<灏嗚鍒掔殑瀹炴柦姝ラ閫愭潯鍒楀嚭>

Constraints:
- Follow existing code conventions in this project
- Handle edge cases and errors properly
- Keep changes minimal and focused on the plan
- Do NOT modify files outside the plan's scope

### Step 3: Self-Verification
After implementation:
- Run lint/typecheck if available
- Run existing tests: <浠庤鍒掍腑鎻愬彇娴嬭瘯鍛戒护锛屽鏃犲垯 "run project's test suite">
- Verify no regressions in touched modules

## Output Format
Respond with a structured report:

### CONTEXT_GATHERED
<What information was searched/found, key findings from MCP tools>

### CHANGES_MADE
For each file changed:
- File path
- What was changed and why
- Lines added/removed

### VERIFICATION_RESULTS
- Lint/typecheck: pass/fail
- Tests: pass/fail (details if fail)
- Manual checks performed

### REMAINING_ISSUES
<Any unresolved issues, edge cases, or suggestions>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Codex 鍏ㄦ潈鎵ц锛?璁″垝鏍囬>"
})
```

**馃搶 璁板綍 SESSION_ID**锛坄CODEX_EXEC_SESSION`锛?
濡傛灉璁″垝涓棤 `CODEX_SESSION`锛堢敤鎴疯烦杩囦簡 `/ccg:plan` 鐨勫妯″瀷鍒嗘瀽锛夛紝鍒欎娇鐢ㄦ柊浼氳瘽銆?
鐢?`TaskOutput` 绛夊緟瀹屾垚銆?
---

### 馃攳 Phase 2锛欳laude 杞婚噺瀹℃牳

`[妯″紡锛氬鏍竇`

**Claude 鍙仛鏈€灏忛獙璇侊紝涓嶉噸澶?Codex 宸插仛鐨勫伐浣?*锛?
1. **璇诲彇 Codex 鎶ュ憡**锛氳В鏋?CONTEXT_GATHERED / CHANGES_MADE / VERIFICATION_RESULTS / REMAINING_ISSUES
2. **鏌ョ湅瀹為檯鍙樻洿**锛?
   ```
   Bash({ command: "git diff HEAD", description: "鏌ョ湅 Codex 瀹為檯鍙樻洿" })
   ```

3. **蹇€熷垽瀹?*锛?   - 鍙樻洿鏄惁鍦ㄨ鍒掕寖鍥村唴锛?   - 鏄惁鏈夋槑鏄惧畨鍏?閫昏緫闂锛?   - 娴嬭瘯鏄惁閫氳繃锛?
4. **澶勭悊缁撴灉**锛?   - 鉁?**閫氳繃** 鈫?Phase 3 澶氭ā鍨嬪鏍?   - 鈿狅笍 **灏忛棶棰?* 鈫?Claude 鐩存帴淇锛? 10 琛岀殑淇 Claude 鑷繁鍋氾級
   - 鉂?**闇€杩斿伐** 鈫?Phase 2.5 杩藉姞鎸囦护

---

### 馃攧 Phase 2.5锛氳拷鍔犳寚浠わ紙浠呭湪闇€杩斿伐鏃讹級

`[妯″紡锛氳拷鍔燷`

**澶嶇敤 Codex 浼氳瘽锛屼笅鍙戜慨姝ｆ寚浠?*锛?
```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <CODEX_EXEC_SESSION> - \"{{WORKDIR}}\" <<'FIXEOF'
<TASK>
The implementation needs corrections:

## Issues Found
1. <闂鎻忚堪 + 鍏蜂綋鏂囦欢:琛屽彿>
2. <闂鎻忚堪 + 鍏蜂綋鏂囦欢:琛屽彿>

## Required Fixes
1. <鍏蜂綋淇瑕佹眰>
2. <鍏蜂綋淇瑕佹眰>

Apply fixes and re-run tests. Report results in the same format.
</TASK>
FIXEOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Codex 淇锛?闂绠€杩?"
})
```

绛夊緟瀹屾垚鍚庡洖鍒?Phase 2銆?*鏈€澶?2 杞繑宸?*锛岃秴杩囧垯 Claude 鐩存帴鎺ョ淇銆?
---

### 鉁?Phase 3锛氬妯″瀷瀹℃牳

`[妯″紡锛氬鏍竇`

**骞惰璋冪敤 {{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 浜ゅ弶瀹℃煡**锛堝妯″瀷鍗忓悓涓嶅彉锛夛細

1. **鑾峰彇鍙樻洿 diff**锛?
   ```
   Bash({ command: "git diff HEAD", description: "鑾峰彇瀹屾暣鍙樻洿 diff" })
   ```

2. **骞惰璋冪敤**锛坄run_in_background: true`锛夛細

   - **{{BACKEND_PRIMARY}} 瀹℃煡**锛?     - ROLE_FILE: `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md`
     - 杈撳叆锛氬彉鏇?Diff + 璁″垝鏂囦欢鍐呭
     - 鍏虫敞锛氬畨鍏ㄦ€с€佹€ц兘銆侀敊璇鐞嗐€侀€昏緫姝ｇ‘鎬?
   - **{{FRONTEND_PRIMARY}} 瀹℃煡**锛?     - ROLE_FILE: `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md`
     - 杈撳叆锛氬彉鏇?Diff + 璁″垝鏂囦欢鍐呭
     - 鍏虫敞锛氫唬鐮佸彲璇绘€с€佽璁′竴鑷存€с€佸彲缁存姢鎬?
   鐢?`TaskOutput` 绛夊緟涓や釜妯″瀷鐨勫畬鏁村鏌ョ粨鏋溿€?
3. **鏁村悎瀹℃煡鎰忚**锛?   - 鎸変俊浠昏鍒欙細鍚庣闂浠?Codex 涓哄噯锛屽墠绔棶棰樹互 {{FRONTEND_PRIMARY}} 涓哄噯
   - **Critical** 鈫?蹇呴』淇锛圕laude 鐩存帴淇垨鍐嶆淳 Codex锛?   - **Warning** 鈫?寤鸿淇锛屾姤鍛婄粰鐢ㄦ埛鍐冲畾
   - **Info** 鈫?璁板綍涓嶅鐞?
4. **鎵ц淇**锛堝鏈?Critical锛夛細
   - < 10 琛屼慨姝ｏ細Claude 鐩存帴淇?   - 鈮?10 琛屼慨姝ｏ細鍐嶆淳 Codex锛堝鐢?`CODEX_EXEC_SESSION`锛?   - 淇鍚庡彲閫夐噸澶?Phase 3锛堢洿鍒伴闄╁彲鎺ュ彈锛?
---

### 馃摝 Phase 4锛氫氦浠?
`[妯″紡锛氫氦浠榏`

鍚戠敤鎴锋姤鍛婏細

```markdown
## 鉁?鎵ц瀹屾垚

### 鎵ц鎽樿
| 椤圭洰 | 璇︽儏 |
|------|------|
| 璁″垝 | <璁″垝鏂囦欢璺緞> |
| 妯″紡 | Codex 鍏ㄦ潈鎵ц + 澶氭ā鍨嬪鏍?|
| 鎼滅储 | <Codex 浣跨敤浜嗗摢浜?MCP 宸ュ叿锛屽叧閿彂鐜? |
| 鍙樻洿 | <N 涓枃浠讹紝+X/-Y 琛? |
| 娴嬭瘯 | <閫氳繃/澶辫触> |
| 杩斿伐 | <0/1/2 杞? |

### 鍙樻洿娓呭崟
| 鏂囦欢 | 鎿嶄綔 | 璇存槑 |
|------|------|------|
| path/to/file.ts | 淇敼/鏂板 | 鎻忚堪 |

### 瀹℃牳缁撴灉
- Codex 瀹℃煡锛?閫氳繃/鍙戠幇 N 涓棶棰?
- {{FRONTEND_PRIMARY}} 瀹℃煡锛?閫氳繃/鍙戠幇 N 涓棶棰?
- Claude 澶勭悊锛?宸蹭慨澶?N 涓?Critical锛孨 涓?Warning 寰呯敤鎴峰喅瀹?

### 鍚庣画寤鸿
1. [ ] <寤鸿鐨勬祴璇曟楠?
2. [ ] <寤鸿鐨勯獙璇佹楠?
```

---

## 鍏抽敭瑙勫垯

1. **Claude 鏋佺畝鍘熷垯** 鈥?Claude 涓嶈皟鐢?MCP銆佷笉鍋氫唬鐮佹绱€傚彧璇昏鍒掋€佹寚鎸?Codex銆佸鏍哥粨鏋溿€?2. **{{BACKEND_PRIMARY}} 鍏ㄦ潈鎵ц** 鈥?MCP 鎼滅储銆佹枃妗ｆ煡璇€佷唬鐮佹绱€佸疄鐜般€佹祴璇曞叏鐢?{{BACKEND_PRIMARY}} 瀹屾垚銆?3. **澶氭ā鍨嬪鏍镐笉鍙?* 鈥?瀹℃牳闃舵浠嶇劧 Codex 鈭?{{FRONTEND_PRIMARY}} 浜ゅ弶瀹℃煡锛屼繚璇佽川閲忋€?4. **淇′换瑙勫垯** 鈥?鍚庣浠?Codex 涓哄噯锛屽墠绔互 {{FRONTEND_PRIMARY}} 涓哄噯銆?5. **涓€娆℃€т笅鍙?* 鈥?灏介噺涓€娆＄粰 Codex 瀹屾暣鎸囦护 + 瀹屾暣璁″垝锛屽噺灏戞潵鍥為€氫俊銆?6. **鏈€澶?2 杞繑宸?* 鈥?瓒呰繃 2 杞?Claude 鐩存帴鎺ョ锛岄伩鍏嶆棤闄愬惊鐜€?7. **璁″垝瀵归綈** 鈥?Codex 瀹炵幇蹇呴』鍦ㄨ鍒掕寖鍥村唴锛岃秴鍑鸿寖鍥寸殑鍙樻洿瑙嗕负杩濊銆?
---

## 浣跨敤鏂规硶

```bash
# 鏍囧噯娴佺▼锛氬厛瑙勫垝锛屽啀鎵ц
/ccg:plan 瀹炵幇鐢ㄦ埛璁よ瘉鍔熻兘
# 瀹℃煡璁″垝鍚?..
/ccg:codex-exec .claude/plan/user-auth.md

# 鐩存帴鎵ц锛堜細鎻愮ず鍏?/ccg:plan锛?/ccg:codex-exec 瀹炵幇鐢ㄦ埛璁よ瘉鍔熻兘
```

---

## 涓?/ccg:plan 鐨勫叧绯?
```
/ccg:plan 鈹€鈹€鈫?.claude/plan/xxx.md
                    鈹?          鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?          鈫?                  鈫?   /ccg:execute        /ccg:codex-exec
   (Claude 閲嶆瀯)       (Codex 鍏ㄦ潈)
   Claude 楂樻秷鑰?      Claude 鏋佷綆娑堣€?   绮剧粏鎺у埗             楂樻晥鎵ц
```

鐢ㄦ埛鍙牴鎹换鍔＄壒鐐归€夋嫨锛?- **闇€瑕佺簿缁嗘帶鍒?* 鈫?`/ccg:execute`锛圕laude 閫愯閲嶆瀯锛?- **闇€瑕侀珮鏁堟墽琛?* 鈫?`/ccg:codex-exec`锛圕odex 涓€鎶婃锛?

