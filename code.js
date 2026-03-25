/**
 * 世界生態之旅：猜猜我是誰？ (2026 穩定版)
 */
function doPost(e) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var apiKey = scriptProperties.getProperty('GEMINI_API_KEY'); 

    if (!apiKey) {
      return createJsonResponse({ "reply": "錯誤：找不到 API 金鑰。" });
    }

    var requestData = JSON.parse(e.postData.contents);
    var history = requestData.history || [];
    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey;
    
    // --- 核心 Prompt 調整：表情減量、回答具體化 ---
    var systemPrompt = "你是一個國小四年級自然科「世界生態」導遊。\n\n" +
      "【說話風格】\n" +
      "1. 語氣親切專業，不要使用過多贅字。\n" +
      "2. **限制表情符號**：每一段回覆最多只能出現 2 個表情符號，請放在句尾，不要放在句子中間。\n\n" +
      "【遊戲規則】\n" +
      "1. **直接回答**：不要重複開場白，直接針對學生問題給予「具體」的特徵描述。禁止回答「不一定」、「還可以」這種模糊詞彙。\n" +
      "2. **科學事實**：回答必須符合該動物真實的棲地（氣候、溫度）與生理構造（毛皮、牙齒、腳掌）。\n" +
      "3. **精準計數**：當學生猜中時，計算歷史紀錄中詢問『特徵』的次數。排除指令（如：好、開始）與猜測動作（如：你是企鵝嗎）。\n" +
      "4. **成功回饋**：恭喜答對後，簡單解釋該生物如何適應當地的極端氣候（限 2 句內）。";

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
    
    var response = UrlFetchApp.fetch(apiUrl, options);
    var result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200 && result.candidates) {
      var aiReply = result.candidates[0].content.parts[0].text;
      return createJsonResponse({ "reply": aiReply });
    } else {
      return createJsonResponse({ "reply": "導遊正在確認地圖，請稍等一下再問我。" });
    }

  } catch (error) {
    return createJsonResponse({ "reply": "發生錯誤：" + error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
