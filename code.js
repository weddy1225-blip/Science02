/**
 * 世界生態之旅：猜猜我是誰？ (同步強化版)
 */
function doPost(e) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var apiKey = scriptProperties.getProperty('GEMINI_API_KEY'); 

    if (!apiKey) return createJsonResponse({ "reply": "錯誤：找不到 API 金鑰。" });

    var requestData = JSON.parse(e.postData.contents);
    var history = requestData.history || [];
    var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey;
    
    var systemPrompt = "你是一個國小自然科導遊。每段話限用 2 個表情符號。\n\n" +
      "【遊戲引導】\n" +
      "1. 當學生猜對時，請務必問他們：「下一站想去沙漠、深海還是森林挑戰？」(這是啟動網頁歸零的關鍵字)。\n" +
      "2. 學生回答想去的環境後，請立刻開始新局，選定一個該環境的動物，並給予第一個特徵提示。\n" +
      "3. 猜答案的那句話不計入提問次數，請與網頁計數器同步。";

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
      return createJsonResponse({ "reply": "導遊迷路了，請重整網頁試試。" });
    }
  } catch (error) {
    return createJsonResponse({ "reply": "系統錯誤：" + error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
