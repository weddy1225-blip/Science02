/**
 * 世界生態之旅：猜猜我是誰？ (同步修正版)
 * 功能：處理對話記憶、全球生物隨機、同步計數邏輯、氣候適應講評
 */
function doPost(e) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var apiKey = scriptProperties.getProperty('GEMINI_API_KEY'); 

    if (!apiKey) {
      return createJsonResponse({ "reply": "錯誤：找不到 API 金鑰。請檢查 GAS 專案設定中的指令碼屬性。" });
    }

    // 1. 解析前端傳來的資料
    var requestData = JSON.parse(e.postData.contents);
    var history = requestData.history || [];
    
    // 2. 設定最新版 API 網址 (Gemini 1.5 Flash)
    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey;
    
    // 3. --- 核心靈魂：世界探險導遊 System Prompt ---
    var systemPrompt = "你現在是一個熱情的國小四年級自然科「世界生態之旅」導遊。\n\n" +
      "【你的角色設定】\n" +
      "1. 語氣充滿冒險、度假氛圍，稱呼學生為「各位小冒險家」。\n" +
      "2. 使用大量生態表情符號（🌍、🦁、🐧、🌵、🏔️）。\n\n" +
      "【遊戲核心規則】\n" +
      "1. **絕對禁止重複自我介紹**：前端網頁已經顯示了歡迎詞。請直接針對學生的提問回答動物特徵。絕對不要說『歡迎來到生態之旅』或『我是導遊』。\n" +
      "2. **隨機全球生物**：每次遊戲請在心中隨機挑選一種具有氣候代表性的動物。\n" +
      "3. **氣候知識連結**：回答必須結合該動物的『真實生理特徵』與『當地的氣候環境』。\n" +
      "4. **【重要：精準計數與講評】**：當學生猜中答案時，請執行：\n" +
      "   - 大聲恭喜答對了！\n" +
      "   - **計次原則**：計算對話中學生問『特徵』的次數。請注意：『你是XX嗎』或『猜答案』的那一話『不計入』提問次數。請確保你說的次數與網頁計數器同步。\n" +
      "   - 範例：如果學生問了 4 個特徵問題，第 5 句話說『你是企鵝』，請說：『哇！你只用了 **4 次** 有效提問就找到我了！』\n" +
      "   - 生態講評：具體分析學生的提問策略，並解釋該生物如何透過生理構造適應當地的極端氣候。\n" +
      "5. **續集邀請**：詢問下一站想去「乾燥沙漠」、「深海世界」還是「高山森林」挑戰。";

    // 4. 組合資料封包
    var payload = {
      "system_instruction": { "parts": [{ "text": systemPrompt }] },
      "contents": history
    };
    
    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };
    
    // 5. 執行請求
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    var result = JSON.parse(responseText);
    
    // 6. 處理回應結果
    if (responseCode === 200 && result.candidates && result.candidates.length > 0) {
      var aiReply = result.candidates[0].content.parts[0].text;
      return createJsonResponse({ "reply": aiReply });
    } else if (responseCode === 429) {
      return createJsonResponse({ "reply": "哎呀！導遊說話太快，喉嚨有點渴，請等 1 分鐘後再嘗試喔！🍵✨" });
    } else {
      return createJsonResponse({ 
        "reply": "導遊迷路了！(錯誤碼：" + responseCode + ")。請稍等一下再重新出發！" 
      });
    }

  } catch (error) {
    return createJsonResponse({ "reply": "系統發生未預期錯誤：" + error.toString() });
  }
}

/**
 * 輔助函式
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}
