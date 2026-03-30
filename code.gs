function doPost(e) {
  try {
    var SCRIPT_PROP = PropertiesService.getScriptProperties();
    var API_KEY = SCRIPT_PROP.getProperty('GEMINI_API_KEY');
    
    if (!API_KEY) {
      return createJsonResponse("❌ 錯誤：請在 GAS 專案設定中新增 GEMINI_API_KEY。");
    }

    var requestData = JSON.parse(e.postData.contents);
    var chatHistory = requestData.history; 
    var region = requestData.region || "臺灣"; 
    
    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + API_KEY;
    
    // 💡 系統指令：包含結構化排版指令、Emoji 禁令、提示邏輯
    var sysRole = "你現在是「全球生物猜謎」遊戲主持人。指令：\n" +
      "1. 搜查地點：【" + region + "】。請從該地區挑選一種具代表性的特色生物作為目標。\n" +
      "2. ⚡【提示功能】：若玩家提到「提示」或「線索」，請提供一個關於該生物的科學線索（如飲食、棲息環境或特徵），但嚴禁說出名字或使用暗示性的 Emoji。\n" +
      "3. 猜對前：回答簡潔（是/不是/不一定），禁用任何暗示該生物外觀的 Emoji。僅能使用中性 Emoji，如：🔍, 🌳, 🌊, 🌡️, 🧐, 🌿。\n" +
      "4. 當玩家「完全猜對」時，必須使用以下格式回覆：\n\n" +
      "   🎉 **恭喜答對！答案是：[中文名] ([英文名])**\n\n" +
      "   📍 **地理位置**：\n   [簡單說明該生物在該地區的棲息地]\n\n" +
      "   🧬 **生物特徵**：\n   * [特徵一]\n   * [特徵二]\n   * [特徵三]\n\n" +
      "   🌿 **有趣小知識**：\n   [分享一個令人驚訝的事實]\n\n" +
      "   最後詢問：要繼續在【" + region + "】挑戰，還是更換國家探險？\n" +
      "5. 如果玩家要重玩，回覆：「收到！探險隊已抵達新據點，我選好下一種生物了，請開始提問！」";

    var payload = {
      "system_instruction": { "parts": [{ "text": sysRole }] },
      "contents": chatHistory,
      "generationConfig": { "temperature": 0.3 }
    };
    
    var options = {
      'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true 
    };
    
    var response = UrlFetchApp.fetch(apiUrl, options);
    var result = JSON.parse(response.getContentText());
    
    if (result.error) return createJsonResponse("⚠️ 系統目前繁忙或 API Key 無效，請稍候再試。");
    
    return createJsonResponse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    return createJsonResponse("☢️ 發生錯誤：" + error.toString());
  }
}

function createJsonResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ "reply": message })).setMimeType(ContentService.MimeType.JSON);
}
