---
description: 'Agent Teams 8 闃舵浼佷笟绾у伐浣滄祦 - 7 瑙掕壊鍏ㄦ祦绋嬬粺涓€缂栨帓锛堥渶姹傗啋鏋舵瀯鈫掕鍒掆啋寮€鍙戔啋娴嬭瘯鈫掑鏌モ啋淇鈫掗泦鎴愶級'
---
<!-- CCG:TEAM:UNIFIED:START -->

鉀斺洈鉀?**CRITICAL HARD RULE 鈥?AGENT TEAMS ONLY** 鉀斺洈鉀?
**绂佹浣跨敤鏅€?Agent 瀛愪唬鐞嗐€傛湰鍛戒护鐨勬墍鏈夎鑹插繀椤婚€氳繃 Agent Teams 鍒涘缓锛?*

1. **绗竴姝ユ案杩滄槸 TeamCreate** 鈥?鍒涘缓涓€涓?team锛岃幏寰?team_name
2. **鎵€鏈夎鑹查€氳繃 Agent(team_name=..., name=...) spawn** 鈥?杩欐牱瀹冧滑鎵嶆槸鐪熸鐨?teammates
3. **閫氳繃 TaskCreate/TaskUpdate 鍒嗛厤浠诲姟** 鈥?鍏变韩浠诲姟鏉?4. **閫氳繃 SendMessage 閫氫俊** 鈥?teammates 涔嬮棿鐩存帴閫氫俊
5. **绂佹浣跨敤涓嶅甫 team_name 鐨?Agent() 璋冪敤** 鈥?閭ｆ槸鏅€氬瓙浠ｇ悊锛屼笉鏄?Agent Teams

**姝ｇ‘绀鸿寖锛堝繀椤昏繖鏍峰仛锛?*:
```
TeamCreate({ team_name: "todo-crud-team", description: "..." })

TaskCreate({ subject: "鏋舵瀯钃濆浘璁捐", description: "..." })

Agent({ team_name: "todo-crud-team", name: "architect", prompt: "...", model: "sonnet" })

TaskUpdate({ taskId: "1", owner: "architect" })
```

**閿欒绀鸿寖锛堢粷瀵圭姝級**:
```
鉂?Agent({ prompt: "...", subagent_type: "Plan" })          鈫?杩欐槸鏅€氬瓙浠ｇ悊锛?鉂?Agent({ description: "...", prompt: "..." })              鈫?娌℃湁 team_name锛?鉂?Agent({ name: "architect", prompt: "..." })               鈫?娌℃湁 team_name锛?```

杩濆弽姝よ鍒?= 鏁翠釜宸ヤ綔娴佹棤鏁堬紝蹇呴』閲嶆潵銆?
鉀斺洈鉀?**END HARD RULE** 鉀斺洈鉀?
---

**Core Philosophy**
- 鍗曞懡浠ゅ畬鎴愪粠闇€姹傚埌浜や粯鐨勫畬鏁存祦绋嬶紝瀵规爣澶у巶宸ョ▼鍥㈤槦缂栧埗銆?- Lead锛堜綘鑷繁锛夋槸鎶€鏈€荤洃/PM锛屽彧鍋氱紪鎺掑拰鍐崇瓥锛岀粷涓嶅啓浜у搧浠ｇ爜銆?- 鎵€鏈変笓涓氳鑹诧紙Architect銆丏ev銆丵A銆丷eviewer锛夊潎涓?**Agent Teams 鐪熷疄 teammates**銆?- 蹇呴』閫氳繃 TeamCreate 鍒涘缓 team锛屽啀閫氳繃 Agent(team_name=...) spawn teammates銆?- 閫氳繃 SendMessage 閫氫俊锛岄€氳繃 TaskList/TaskCreate/TaskUpdate 鍗忚皟銆?- {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 澶氭ā鍨嬪垎鏋愬彧鍦?Architecture 鍜?Review 闃舵浣滀负"澶栨彺鍙傝€?娉ㄥ叆銆?
**瑙掕壊缂栧埗锛? 瑙掕壊锛?*

| 瑙掕壊 | 韬唤 | spawn 鏂瑰紡 | 妯″瀷 | 鑱岃矗 |
|------|------|-----------|------|------|
| 馃彌 Lead | 浣犺嚜宸憋紙涓诲璇濓級 | N/A锛堜笉闇€瑕?spawn锛?| Opus | 缂栨帓銆佸喅绛栥€佺敤鎴锋矡閫?|
| 馃彈 Architect | Agent Teams teammate | `Agent(team_name=T, name="architect")` | Opus | 浠ｇ爜搴撴壂鎻忋€佹灦鏋勮摑鍥俱€佹枃浠跺垎閰?|
| 馃摐 Dev 脳 N | Agent Teams teammates | `Agent(team_name=T, name="dev-1")` | Sonnet | 骞惰缂栫爜锛屾枃浠堕殧绂?|
| 馃И QA | Agent Teams teammate | `Agent(team_name=T, name="qa")` | Sonnet | 鍐欐祴璇曘€佽窇娴嬭瘯銆乴int銆乼ypecheck |
| 馃敩 Reviewer | Agent Teams teammate | `Agent(team_name=T, name="reviewer")` | Sonnet | 缁煎悎瀹℃煡锛屽垎绾у垽鍐?|
| 馃敟 {{BACKEND_PRIMARY}} | 澶栭儴妯″瀷锛堥潪 teammate锛?| Bash + codeagent-wrapper | {{BACKEND_PRIMARY}} | 鍚庣鍒嗘瀽/瀹℃煡锛圥hase 2, 6锛?|
| 馃敭 {{FRONTEND_PRIMARY}} | 澶栭儴妯″瀷锛堥潪 teammate锛?| Bash + codeagent-wrapper | {{FRONTEND_PRIMARY}} | 鍓嶇鍒嗘瀽/瀹℃煡锛圥hase 2, 6锛?|

**8 闃舵娴佹按绾?*

```
Phase 0: PRE-FLIGHT    鈫?鐜妫€娴?Phase 1: REQUIREMENT   鈫?Lead 闇€姹傚寮?鈫?mini-PRD
Phase 2: ARCHITECTURE  鈫?Codex鈭emini 鍒嗘瀽 + Architect teammate 鍑鸿摑鍥?Phase 3: PLANNING      鈫?Lead 鎷嗕换鍔?鈫?闆跺喅绛栧苟琛岃鍒?Phase 4: DEVELOPMENT   鈫?Dev脳N teammates 骞惰缂栫爜
Phase 5: TESTING       鈫?QA teammate 鍐欐祴璇?璺戞祴璇?Phase 6: REVIEW        鈫?Codex鈭emini 瀹℃煡 + Reviewer teammate 缁煎悎鍒ゅ喅
Phase 7: FIX           鈫?Dev teammate(s) 淇 Critical锛堟渶澶?2 杞級
Phase 8: INTEGRATION   鈫?Lead 鍏ㄩ噺楠岃瘉 + 鎶ュ憡 + 娓呯悊
```

**Guardrails**
- **Agent Teams 蹇呴』鍚敤**锛氶渶瑕?`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`銆?- Lead 缁濅笉鐩存帴淇敼浜у搧浠ｇ爜銆?- 姣忎釜 Dev 鍙兘淇敼鍒嗛厤缁欏畠鐨勬枃浠躲€?- QA 鍙啓娴嬭瘯鏂囦欢锛屼笉鏀逛骇鍝佷唬鐮併€?- Reviewer 鍙涓嶅啓銆?- Architect 鍙涓嶅啓銆?- Phase 7 鏈€澶?2 杞慨澶嶅惊鐜€?
**Steps**

---

### Phase 0: PRE-FLIGHT + 鍒涘缓 Team

1. **鑾峰彇宸ヤ綔鐩綍**
   - 閫氳繃 Bash 鎵ц `pwd` 鑾峰彇褰撳墠宸ヤ綔鐩綍鐨勭粷瀵硅矾寰勶紝淇濆瓨涓?WORKDIR銆?
2. **瑙ｆ瀽 $ARGUMENTS**
   - 濡傛灉鍙傛暟涓虹┖锛岀敤 AskUserQuestion 璇锋眰浠诲姟鎻忚堪銆?   - 浠庝换鍔℃弿杩颁腑鎻愬彇涓€涓嫳鏂囩煭妯嚎鍛藉悕鐨勪换鍔″悕锛堝 `todo-crud`锛夛紝鐢ㄤ簬鏂囦欢鍛藉悕鍜?team 鍛藉悕銆?
3. **鉀?绔嬪嵆鍒涘缓 Team 鈥?杩欐槸浣犵殑绗竴涓伐鍏疯皟鐢ㄥ姩浣?*
   - 浣犲繀椤荤幇鍦ㄥ氨璋冪敤 TeamCreate 宸ュ叿銆備笉鏄◢鍚庯紝涓嶆槸鍦?Phase 2锛岃€屾槸**鐜板湪**銆?   - 璋冪敤 TeamCreate锛屽弬鏁帮細team_name 璁句负 `<浠诲姟鍚?-team`锛宒escription 璁句负浠诲姟鎻忚堪銆?   - 杩欎竴姝ュ垱寤轰簡鍏变韩浠诲姟鏉垮拰閫氫俊閫氶亾銆傚悗缁墍鏈?Agent 璋冪敤閮藉繀椤诲甫涓婅繖涓?team_name銆?   - 濡傛灉 TeamCreate 澶辫触锛圓gent Teams 鏈惎鐢級锛岃緭鍑哄惎鐢ㄦ寚寮曞悗缁堟銆?
---

### Phase 1: REQUIREMENT

**鎵ц鑰?*锛歀ead锛堜綘鑷繁锛?
1. **闇€姹傚寮?*
   - 鍒嗘瀽 $ARGUMENTS 鐨勬剰鍥俱€佺己澶变俊鎭€侀殣鍚亣璁俱€?   - 琛ュ叏涓虹粨鏋勫寲闇€姹傦細鏄庣‘鐩爣銆佹妧鏈害鏉熴€佽寖鍥磋竟鐣屻€侀獙鏀舵爣鍑嗐€?
2. **鐢熸垚 mini-PRD**
   - 鐢?Glob/Grep/Read 蹇€熸壂鎻忛」鐩粨鏋勶紝浜嗚В鎶€鏈爤銆?   - 鍐欏叆 `.claude/team-plan/<浠诲姟鍚?-prd.md`锛?
   ```markdown
   # PRD: <浠诲姟鍚?
   ## 鐩爣
   <涓€鍙ヨ瘽鎻忚堪>
   ## 鍔熻兘鑼冨洿
   - 鍖呭惈锛歔鍒楄〃]
   - 涓嶅寘鍚細[鍒楄〃]
   ## 鎶€鏈笂涓嬫枃
   - 鎶€鏈爤锛歔鑷姩妫€娴媇
   - 椤圭洰缁撴瀯锛歔鍏抽敭鐩綍]
   ## 楠屾敹鏍囧噯
   - [AC-1] <鍙獙璇佹潯浠?
   - [AC-2] ...
   ```

3. **鐢ㄦ埛纭**
   - 鐢?`AskUserQuestion` 灞曠ず PRD 鎽樿锛岃姹傜‘璁ゆ垨琛ュ厖銆?
---

### Phase 2: ARCHITECTURE

**鎵ц鑰?*锛歀ead 璋冪敤 {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鈫?Architect teammate 缁煎悎

1. **Team 宸插湪 Phase 0 鍒涘缓**锛岀洿鎺ヤ娇鐢ㄥ凡鏈夌殑 team_name銆?
2. **{{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 骞惰鍒嗘瀽锛圥ARALLEL锛?*
   - **CRITICAL**: 蹇呴』鍦ㄤ竴鏉℃秷鎭腑鍚屾椂鍙戣捣涓や釜 Bash 璋冪敤锛宍run_in_background: true`銆?
   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md\n<TASK>\n闇€姹傦細<PRD 鍐呭>\n璇峰垎鏋愬悗绔灦鏋勶細妯″潡杈圭晫銆丄PI 璁捐銆佹暟鎹ā鍨嬨€佷緷璧栧叧绯汇€佸疄鏂藉缓璁€俓n</TASK>\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 鍚庣鏋舵瀯鍒嗘瀽"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md\n<TASK>\n闇€姹傦細<PRD 鍐呭>\n璇峰垎鏋愬墠绔灦鏋勶細缁勪欢鎷嗗垎銆佺姸鎬佺鐞嗐€佽矾鐢辫璁°€乁I/UX 瑕佺偣銆佸疄鏂藉缓璁€俓n</TASK>\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 鍓嶇鏋舵瀯鍒嗘瀽"
   })
   ```

   **绛夊緟缁撴灉**:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<frontend_task_id>", block: true, timeout: 600000 })
   ```

   鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢 {{FRONTEND_PRIMARY}} 璋冪敤澶辫触锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆? 娆″叏璐ユ墠璺宠繃銆?   鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛欳odex 鎵ц 5-15 鍒嗛挓灞炴甯革紝瓒呮椂鍚庣户缁疆璇紝绂佹璺宠繃銆?
3. **Spawn Architect teammate**
   - 鍏堣皟鐢?TaskCreate 宸ュ叿锛宻ubject 涓?"鏋舵瀯钃濆浘璁捐"銆?   - 鐒跺悗璋冪敤 Agent 宸ュ叿 spawn Architect銆?*浣犲繀椤诲湪 Agent 宸ュ叿璋冪敤涓缃互涓嬪弬鏁?*锛?     * **team_name**: 璁句负 Phase 0 鍒涘缓鐨?team name锛堝 `todo-crud-team`锛?     * **name**: 璁句负 `"architect"`
     * **model**: 璁句负 `"opus"`
     * **prompt**: 鍖呭惈 PRD 鍐呭銆丆odex/{{FRONTEND_PRIMARY}} 鍒嗘瀽鎽樿锛堝鏈夛級銆乄ORKDIR銆佷互鍙婃寚浠わ紙鎵弿浠ｇ爜搴撯啋璁捐钃濆浘鈫掕緭鍑烘枃浠跺垎閰嶇煩闃碘啋鍐欏叆 .claude/team-plan/鈫掓爣璁?completed锛?   - 璋冪敤 TaskUpdate 灏嗕换鍔?owner 璁句负 `"architect"`銆?   - 绛夊緟 Architect 瀹屾垚锛堝畠浼氳嚜鍔ㄥ彂娑堟伅閫氱煡浣狅級銆?
4. **璇诲彇钃濆浘**
   - Read `.claude/team-plan/<浠诲姟鍚?-blueprint.md`
   - 楠岃瘉鏂囦欢鍒嗛厤鐭╅樀瀹屾暣鎬э紙姣忎釜鏂囦欢鍙湪涓€涓?Dev 闆嗗悎涓級銆?
5. **Shutdown Architect**
   - `SendMessage({ to: "architect", message: { type: "shutdown_request" } })`

---

### Phase 3: PLANNING

**鎵ц鑰?*锛歀ead锛堜綘鑷繁锛?
1. **鍩轰簬钃濆浘鎷嗗垎瀛愪换鍔?*
   - 璇诲彇钃濆浘涓殑鏂囦欢鍒嗛厤鐭╅樀銆?   - 涓烘瘡涓?Dev 鏂囦欢闆嗗悎鍒涘缓涓€涓瓙浠诲姟銆?   - 姣忎釜瀛愪换鍔″繀椤诲寘鍚細
     * 绮剧‘鐨勬枃浠惰寖鍥达紙浠庤摑鍥剧殑鏂囦欢鍒嗛厤鐭╅樀锛?     * 鍏蜂綋鐨勫疄鏂芥楠わ紙浠庤摑鍥剧殑璁捐鏂规锛?     * 楠屾敹鏍囧噯锛堜粠钃濆浘鍜?PRD锛?
2. **纭繚鏂囦欢闅旂**
   - 鏍￠獙锛氫换浣曟枃浠朵笉鍑虹幇鍦ㄤ袱涓瓙浠诲姟涓€?   - 鑻ュ彂鐜伴噸鍙?鈫?灏嗛噸鍙犳枃浠舵斁鍏ュ悓涓€瀛愪换鍔★紝鎴栬缃緷璧栧叧绯汇€?
3. **骞惰鍒嗗眰**
   - Layer 1锛氭棤渚濊禆鐨勫瓙浠诲姟锛堝彲骞惰锛夈€?   - Layer 2锛氫緷璧?Layer 1 鐨勫瓙浠诲姟銆?
4. **鍐欏叆璁″垝鏂囦欢**
   - 璺緞锛歚.claude/team-plan/<浠诲姟鍚?-plan.md`
   - 鏍煎紡鍚岀幇鏈?team-plan 杈撳嚭鏍煎紡锛堣 `/ccg:team-plan`锛夈€?
5. **鐢ㄦ埛纭**
   - 鐢?`AskUserQuestion` 灞曠ず璁″垝鎽樿锛?     ```
     馃搵 鍗冲皢骞惰瀹炴柦锛?     - 瀛愪换鍔★細N 涓?     - 骞惰鍒嗙粍锛歀ayer 1 (X 涓苟琛? 鈫?Layer 2 (Y 涓?
     - Dev 鏁伴噺锛歂 涓?     纭寮€濮嬶紵
     ```

---

### Phase 4: DEVELOPMENT

**鎵ц鑰?*锛欴ev 脳 N teammates锛堚洈 蹇呴』骞惰锛?
鉀?**鏍稿績瑙勫垯锛氭墍鏈夊悓 Layer 鐨?Dev 蹇呴』鍦ㄥ悓涓€鏉℃秷鎭腑鍚屾椂 spawn锛岃瀹冧滑骞惰璺戙€傜姝覆琛岋紙spawn dev-1 鈫?绛夊畬鎴?鈫?spawn dev-2锛夈€?*

1. **涓€娆℃€у垱寤烘墍鏈?Task + 璁剧疆渚濊禆**
   - 涓鸿摑鍥句腑鐨勬瘡涓瓙浠诲姟璋冪敤 TaskCreate锛堝湪鍚屼竴杞畬鎴愭墍鏈?TaskCreate锛夈€?   - 濡傛湁 Layer 渚濊禆锛氱敤 TaskUpdate 鐨?addBlockedBy 璁剧疆銆?
2. **鉀?鍦ㄥ悓涓€鏉℃秷鎭腑骞惰 spawn 鎵€鏈夊悓 Layer 鐨?Dev**
   - 浣犲繀椤诲湪**涓€鏉℃秷鎭腑鍙戣捣澶氫釜 Agent 宸ュ叿璋冪敤**锛屾瘡涓?Dev 涓€涓?Agent 璋冪敤銆?   - 渚嬪 3 涓苟琛?Dev锛屼綘鐨勮繖鏉℃秷鎭簲鍖呭惈 3 涓?Agent 宸ュ叿璋冪敤锛屽畠浠細鍚屾椂鍚姩銆?   - 姣忎釜 Agent 璋冪敤蹇呴』璁剧疆锛?     * **team_name**: Phase 0 鍒涘缓鐨?team name
     * **name**: `"dev-1"`, `"dev-2"`, `"dev-3"` 绛?     * **model**: `"sonnet"`
     * **prompt**: 鍖呭惈璇?Dev 鐨勫瓙浠诲姟鍐呭銆乄ORKDIR銆佹枃浠惰寖鍥寸害鏉熴€佸疄鏂芥楠ゃ€侀獙鏀舵爣鍑?   - spawn 鍚庣珛鍗冲姣忎釜 Task 璋冪敤 TaskUpdate 璁?owner銆?
   绀烘剰锛? 涓?Dev 骞惰锛夛細
   浣犵殑涓€鏉℃秷鎭腑鍚屾椂鍖呭惈锛?   - Agent(team_name=T, name="dev-1", prompt="...浠诲姟1...")
   - Agent(team_name=T, name="dev-2", prompt="...浠诲姟2...")
   - Agent(team_name=T, name="dev-3", prompt="...浠诲姟3...")
   涓変釜 Dev 鍚屾椂鍚姩锛屽苟琛屽伐浣溿€?
3. **绛夊緟鎵€鏈?Dev 瀹屾垚**
   - teammates 瀹屾垚鍚庝細鑷姩鍙戞秷鎭€氱煡锛屾棤闇€杞銆?   - 濡傛灉鏌愪釜 Dev 閬囧埌闂骞跺彂娑堟伅姹傚姪锛氶€氳繃 SendMessage 鍥炲鎸囧銆?   - 濡傛灉鏌愪釜 Dev 澶辫触锛氳褰曞け璐ュ師鍥狅紝涓嶅奖鍝嶅叾浠?Dev 缁х画銆?
4. **Layer 2锛堝鏈夛級**
   - Layer 1 鎵€鏈?Dev 瀹屾垚鍚庯紝鍚屾牱鍦ㄤ竴鏉℃秷鎭腑骞惰 spawn Layer 2 鐨勬墍鏈?Dev銆?
5. **鎵€鏈?Dev 瀹屾垚鍚庯紝Shutdown 鎵€鏈?Dev**
   - 閫愪竴鍙戦€?shutdown_request銆?
---

### Phase 5: TESTING

**鎵ц鑰?*锛歈A teammate

1. **鏀堕泦鍙樻洿娓呭崟**
   - 杩愯 `git diff --name-only` 鑾峰彇鎵€鏈夊彉鏇存枃浠跺垪琛ㄣ€?
2. **Spawn QA teammate**
   - 璋冪敤 TaskCreate锛宻ubject 涓?"QA: 鍏ㄩ噺娴嬭瘯楠岃瘉"銆?   - 璋冪敤 Agent 宸ュ叿锛?*蹇呴』璁剧疆浠ヤ笅鍙傛暟**锛?     * **team_name**: Phase 0 鍒涘缓鐨?team name
     * **name**: `"qa"`
     * **model**: `"sonnet"`
     * **prompt**: 鍖呭惈鍙樻洿鏂囦欢鍒楄〃銆侀獙鏀舵爣鍑嗐€乄ORKDIR銆佷互鍙婃寚浠わ紙妫€娴嬫祴璇曟鏋垛啋鍐欐祴璇曗啋璺戝叏閲忊啋杈撳嚭鎶ュ憡鈫掓爣璁?completed锛?   - 璋冪敤 TaskUpdate 璁?owner 涓?`"qa"`銆?   - 绛夊緟 QA 瀹屾垚锛堝畠浼氳嚜鍔ㄥ彂娑堟伅閫氱煡浣狅級銆?
3. **璇诲彇 QA 鎶ュ憡**
   - 浠?QA 鐨勬秷鎭垨浠诲姟 metadata 涓幏鍙栬川閲忔姤鍛娿€?   - 濡傛灉娴嬭瘯鍏ㄩ儴閫氳繃 鈫?缁х画 Phase 6銆?   - 濡傛灉娴嬭瘯澶辫触 鈫?璁板綍澶辫触椤癸紝缁х画 Phase 6锛圧eview 鍙兘鍙戠幇鏍瑰洜锛夈€?
4. **Shutdown QA**
   - `SendMessage({ to: "qa", message: { type: "shutdown_request" } })`

---

### Phase 6: REVIEW

**鎵ц鑰?*锛歀ead 璋冪敤 {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 鈫?Reviewer teammate 缁煎悎

1. **杩愯 git diff 鑾峰彇鍙樻洿**
   - `Bash: git diff` 鑾峰彇瀹屾暣鍙樻洿鍐呭銆?
2. **{{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 骞惰瀹℃煡锛圥ARALLEL锛?*
   - 妯″紡涓?Phase 2 鐩稿悓锛屼娇鐢?reviewer prompt锛?
   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md\n<TASK>\n瀹℃煡浠ヤ笅鍙樻洿锛歕n<git diff 杈撳嚭鎴栧彉鏇存枃浠跺垪琛?\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [{\"severity\": \"Critical|Warning|Info\", \"dimension\": \"logic|security|performance|error_handling\", \"file\": \"path\", \"line\": N, \"description\": \"鎻忚堪\", \"fix_suggestion\": \"淇寤鸿\"}],\n  \"passed_checks\": [\"妫€鏌ラ」\"],\n  \"summary\": \"鎬讳綋璇勪及\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 鍚庣瀹℃煡"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md\n<TASK>\n瀹℃煡浠ヤ笅鍙樻洿锛歕n<git diff 杈撳嚭鎴栧彉鏇存枃浠跺垪琛?\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [{\"severity\": \"Critical|Warning|Info\", \"dimension\": \"patterns|maintainability|accessibility|ux|frontend_security\", \"file\": \"path\", \"line\": N, \"description\": \"鎻忚堪\", \"fix_suggestion\": \"淇寤鸿\"}],\n  \"passed_checks\": [\"妫€鏌ラ」\"],\n  \"summary\": \"鎬讳綋璇勪及\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 鍓嶇瀹℃煡"
   })
   ```

   鉀?**{{FRONTEND_PRIMARY}} 澶辫触蹇呴』閲嶈瘯**锛氳嫢澶辫触锛屾渶澶氶噸璇?2 娆★紙闂撮殧 5 绉掞級銆? 娆″叏璐ユ墠璺宠繃銆?   鉀?**Codex 缁撴灉蹇呴』绛夊緟**锛氳秴鏃跺悗缁х画杞锛岀姝㈣烦杩囥€?
3. **Spawn Reviewer teammate**
   - 璋冪敤 TaskCreate锛宻ubject 涓?"Review: 缁煎悎浠ｇ爜瀹℃煡"銆?   - 璋冪敤 Agent 宸ュ叿锛?*蹇呴』璁剧疆浠ヤ笅鍙傛暟**锛?     * **team_name**: Phase 0 鍒涘缓鐨?team name
     * **name**: `"reviewer"`
     * **model**: `"sonnet"`
     * **prompt**: 鍖呭惈 git diff銆丆odex/{{FRONTEND_PRIMARY}} 瀹℃煡 JSON锛堝鏈夛級銆丵A 鎶ュ憡銆乄ORKDIR銆佷互鍙婃寚浠わ紙鐙珛瀹℃煡鈫掔患鍚堟剰瑙佲啋鍒嗙骇鈫掕緭鍑烘姤鍛娾啋鏍囪 completed锛?   - 璋冪敤 TaskUpdate 璁?owner 涓?`"reviewer"`銆?   - 绛夊緟 Reviewer 瀹屾垚锛堝畠浼氳嚜鍔ㄥ彂娑堟伅閫氱煡浣狅級銆?
4. **璇诲彇瀹℃煡鎶ュ憡**
   - 浠?Reviewer 娑堟伅涓彁鍙?Critical / Warning / Info 鍒楄〃銆?   - 鍚戠敤鎴峰睍绀哄鏌ユ憳瑕併€?
5. **Shutdown Reviewer**
   - `SendMessage({ to: "reviewer", message: { type: "shutdown_request" } })`

---

### Phase 7: FIX (Evaluator-Optimizer Loop)

**鎵ц鑰?*锛欴ev teammate(s)锛屾渶澶?2 杞?
**FIX_ROUND = 0**

1. **鍒ゆ柇鏄惁闇€瑕佷慨澶?*
   - 濡傛灉 Critical == 0 鈫?璺宠繃 Phase 7锛岀洿鎺ヨ繘鍏?Phase 8銆?   - 濡傛灉 Critical > 0 鈫?杩涘叆淇寰幆銆?
2. **淇寰幆锛堟渶澶?2 杞級**

   **WHILE Critical > 0 AND FIX_ROUND < 2:**

   a. **FIX_ROUND += 1**

   b. **鍒涘缓淇浠诲姟**
      - 涓烘瘡涓?Critical finding 鍒涘缓淇浠诲姟銆?      - 鏍规嵁 finding 鐨勬枃浠跺綊灞烇紝鍒嗛厤缁欏搴旂殑 Dev銆?      - 濡傛灉澶氫釜 finding 娑夊強鍚屼竴鏂囦欢 鈫?鍚堝苟涓轰竴涓慨澶嶄换鍔°€?
   c. **Spawn Fix Dev teammate(s)**
      - 璋冪敤 Agent 宸ュ叿锛?*蹇呴』璁剧疆浠ヤ笅鍙傛暟**锛?        * **team_name**: Phase 0 鍒涘缓鐨?team name
        * **name**: `"fix-dev-1"`, `"fix-dev-2"`, ... 渚濇鍛藉悕
        * **model**: `"sonnet"`
        * **prompt**: 鍖呭惈 Critical findings锛堟枃浠躲€佽鍙枫€佹弿杩般€佷慨澶嶅缓璁級銆佹枃浠惰寖鍥寸害鏉熴€乄ORKDIR

   d. **绛夊緟淇瀹屾垚**

   e. **Shutdown Fix Dev(s)**

   f. **杞婚噺楠岃瘉**
      - Lead 閫氳繃 Bash 杩愯娴嬭瘯鍛戒护楠岃瘉淇锛?        ```
        Bash: cd {{WORKDIR}} && <娴嬭瘯鍛戒护>
        ```
      - 蹇€熸鏌ヤ慨澶嶇殑 Critical 鏄惁瑙ｅ喅锛圧ead 淇鐨勬枃浠堕獙璇侊級銆?
   g. **鏇存柊 Critical 璁℃暟**
      - 濡傛灉 Critical 浠?> 0 涓?FIX_ROUND < 2 鈫?缁х画寰幆銆?      - 濡傛灉 FIX_ROUND >= 2 涓?Critical 浠?> 0 鈫?閫€鍑哄惊鐜紝鎶ュ憡鐢ㄦ埛銆?
3. **淇寰幆缁撴潫**
   - 濡傛灉鎵€鏈?Critical 宸蹭慨澶?鈫?缁х画 Phase 8銆?   - 濡傛灉浠嶆湁 Critical 鈫?鐢?`AskUserQuestion` 鎶ュ憡锛?     ```
     缁忚繃 2 杞嚜鍔ㄤ慨澶嶏紝浠嶆湁 N 涓?Critical 闂鏈В鍐筹細
     - [C-X] 鎻忚堪...
     閫夋嫨锛氱户缁墜鍔ㄤ慨澶?/ 璺宠繃骞舵彁浜?     ```

---

### Phase 8: INTEGRATION

**鎵ц鑰?*锛歀ead锛堜綘鑷繁锛?
1. **鍏ㄩ噺楠岃瘉**
   - 杩愯瀹屾暣娴嬭瘯濂椾欢锛歚Bash: cd {{WORKDIR}} && <娴嬭瘯鍛戒护>`
   - 杩愯 lint锛堝鏈夛級銆?   - 杩愯 typecheck锛堝鏈夛級銆?
2. **鐭ヨ瘑娌夋穩**
   - 鍐欏叆鏈€缁堟姤鍛婂埌 `.claude/team-plan/<浠诲姟鍚?-report.md`锛?
   ```markdown
   # Team Report: <浠诲姟鍚?

   ## 姒傝堪
   <涓€鍙ヨ瘽鎻忚堪瀹屾垚鐨勫伐浣?

   ## 鍥㈤槦缂栧埗
   - Architect: 1
   - Dev: N
   - QA: 1
   - Reviewer: 1
   - 澶栨彺: {{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}}

   ## 闃舵鎵ц鎽樿
   | 闃舵 | 鐘舵€?| 鍏抽敭浜у嚭 |
   |------|------|----------|
   | Requirement | 鉁?| PRD |
   | Architecture | 鉁?| 钃濆浘 + 鏂囦欢鍒嗛厤 |
   | Planning | 鉁?| N 涓瓙浠诲姟 |
   | Development | 鉁?鈿狅笍 | 鍙樻洿鏂囦欢鍒楄〃 |
   | Testing | 鉁?鉂?| 娴嬭瘯鎶ュ憡 |
   | Review | 鉁?鈿狅笍 | 瀹℃煡鎶ュ憡 |
   | Fix | 鉁?鈿狅笍/N/A | 淇 N 杞?|

   ## 鍙樻洿鎽樿
   | Dev | 瀛愪换鍔?| 鐘舵€?| 淇敼鏂囦欢 |
   |-----|--------|------|----------|
   | dev-1 | <鍚嶇О> | 鉁?鉂?| file1, file2 |
   | dev-2 | <鍚嶇О> | 鉁?鉂?| file3 |

   ## 瀹℃煡缁撹
   - Critical: 0 鉁?   - Warning: N
   - Info: N

   ## 娴嬭瘯缁撹
   - 閫氳繃: N / 鎬昏: N
   - Lint: 鉁?鉂?   - Typecheck: 鉁?鉂?
   ## 鍚庣画寤鸿
   1. [寤鸿椤筣
   ```

3. **杈撳嚭鏈€缁堟憳瑕?*
   - 鍚戠敤鎴峰睍绀虹畝娲佺殑瀹屾垚鎶ュ憡銆?
4. **娓呯悊 Team**
   - 纭繚鎵€鏈?teammates 宸?shutdown銆?   - 濡傛灉浠嶆湁娲昏穬鐨?teammates 鈫?閫愪竴鍙戦€?shutdown_request銆?   - `TeamDelete()` 娓呯悊 team銆?
---

**Exit Criteria**
- [ ] 鎵€鏈?8 涓樁娈靛凡鎵ц锛堟垨鏄庣‘璺宠繃骞惰褰曞師鍥狅級
- [ ] PRD銆佽摑鍥俱€佽鍒掋€佹姤鍛?4 涓骇鐗╂枃浠跺凡鍐欏叆 `.claude/team-plan/`
- [ ] 鎵€鏈?Critical 瀹℃煡闂宸蹭慨澶嶏紙鎴栫敤鎴风‘璁よ烦杩囷級
- [ ] 娴嬭瘯閫氳繃锛堟垨鐢ㄦ埛纭鎺ュ彈澶辫触椤癸級
- [ ] Team 宸叉竻鐞嗭紙鎵€鏈?teammates shutdown + TeamDelete锛?- [ ] 鏈€缁堟姤鍛婂凡杈撳嚭缁欑敤鎴?<!-- CCG:TEAM:UNIFIED:END -->


