// chat.js
const GEMINI_API_KEY = "AQ.Ab8RN6KO15z8kg7z8w6wlylYqHfGOu91hDs6Yt-Xypfqm5_vcg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Gemini API에 끝말잇기 단어를 요청하는 함수
 */
async function getAIWord(lastChar, usedWords, difficulty) {
    let levelInstruction = "";
    let aiTemperature = 0.7; // 기본 창의성 수치

    // AI 난이도별 지시사항 완벽 분리
    if (difficulty.includes("초보")) {
        levelInstruction = "너는 5살 유치원생이야. 끝말잇기를 잘 못해. 무조건 끝나는 글자가 '기', '자', '가', '사', '다', '나', '마', '바' 처럼 상대방이 이어가기 아주 쉬운 2글자 명사만 말해. (예시: 아기, 사자, 바다, 과자, 나비)";
        aiTemperature = 0.9; 
    } else if (difficulty.includes("중급") || difficulty.includes("고수")) {
        levelInstruction = "너는 평범한 사람이야. 우리가 일상에서 흔히 쓰는 2~3글자 명사를 대답해.";
        aiTemperature = 0.7;
    } else if (difficulty.includes("마스터") || difficulty.includes("울트라") || difficulty.includes("슈퍼")) {
        levelInstruction = "너는 끝말잇기 고수야. 사자성어나 전문용어 등 3~4글자의 다소 어려운 단어를 사용해.";
        aiTemperature = 0.5;
    } else if (difficulty.includes("이수")) {
        levelInstruction = "너는 자비 없는 끝말잇기 세계 최강의 보스야. 반드시 '한방 단어(이을 수 없는 단어)'로만 대답해야 해! 끝나는 글자가 무조건 [녘, 릇, 륨, 듐, 슘, 슭, 꾼, 줌, 쁨, 름] 중 하나로 끝나는 단어만 제시해. (예시: 나트륨, 이리듐, 산기슭, 해질녘, 밥그릇, 장사꾼, 기쁨, 여름, 씨름). 입력된 글자로 시작해야 한다는 규칙은 무조건 지켜.";
        aiTemperature = 0.1; // 보스는 헛소리 안 하고 지시를 엄격하게 따르도록 낮춤
    }

    const promptText = `너는 한국어 끝말잇기 게임 상대야. 
${levelInstruction}
반드시 '${lastChar}'(으)로 시작하는 한국어 명사 단어를 딱 1개만 대답해. 
부연 설명, 마침표, 특수문자 절대 금지. 단어만 출력해.
이미 사용된 단어들: [${usedWords.join(', ')}]. 이 단어들은 절대 사용하지 마.`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: aiTemperature, // 난이도별 창의성 조절
                    maxOutputTokens: 10
                }
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        let aiWord = data.candidates[0].content.parts[0].text.trim();
        aiWord = aiWord.replace(/[^가-힣]/g, ''); // 한글만 추출

        if (aiWord.length < 2 || aiWord.charAt(0) !== lastChar || usedWords.includes(aiWord)) {
            return null; 
        }
        return aiWord;

    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}