let dialogueData = {}; // JSON 데이터를 저장할 변수
let currentPath = "start"; // 현재 대화 경로
let playerName = "아카리"; // 플레이어 이름 고정

// JSON 파일 로드
function loadDialogueData() {
    fetch("dialogueData.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("JSON 파일을 불러오지 못했습니다.");
        }
        console.log("JSON 파일 로드 성공");
        return response.json();
    })
    .then(data => {
        console.log("로드된 데이터:", data);
        dialogueData = data; // JSON 데이터를 저장
        updateDialogue(); // 첫 대화 표시
    })
    .catch(error => {
        console.error("오류 발생:", error);
    });

}
// 대화 업데이트
function updateDialogue() {
    const currentDialogue = dialogueData[currentPath];
    if (!currentDialogue) {
        console.error("대화 데이터가 존재하지 않습니다:", currentPath);
        return;
    }
    // 이미지 경로 설정
    if (currentDialogue.image) {
        gameImage.src = currentDialogue.image; // 대화 데이터에 있는 이미지 경로 사용
    } else {
        gameImage.src = "images/default.png"; // 기본 이미지로 복원
    }

    // 대화 텍스트 출력
    typeText(currentDialogue.text, "currentDialogue", () => {
        const choicesDiv = document.querySelector(".choices");
        choicesDiv.innerHTML = "";

        // 선택지 버튼 생성
        if (currentDialogue.choices) {
            for (const choice in currentDialogue.choices) {
                const button = document.createElement("button");
                button.className = "choice";
                button.innerText = choice;
                button.onclick = () => {
                    addToHistory("하루마사", currentDialogue.text); // 대화 지문 추가
                    addToHistory(playerName, choice); // 플레이어 선택 추가

                    currentPath = currentDialogue.choices[choice]; // 다음 대화 경로로 이동
                    updateDialogue(); // 대화 갱신
                };
                choicesDiv.appendChild(button);
            }
        }

        // 타이핑 효과 종료 후 자동 스크롤
        setTimeout(() => {
            dialogueContainer.scrollTop = dialogueContainer.scrollHeight;
        }, 100); // 약간의 딜레이를 추가하여 확실히 렌더링 후 동작
    });
}

// 타이핑 효과
function typeText(text, elementId, callback) {
    let i = 0;
    const element = document.getElementById(elementId);
    const dialogueContainer = document.querySelector(".dialogue-box");
    element.innerHTML = ""; // 기존 텍스트 초기화

    const interval = setInterval(() => {
        element.innerHTML += text[i] === "\n" ? "<br>" : text[i]; // 줄바꿈 변환
        i++;

        // **타이핑 중에도 스크롤을 따라가도록 설정**
        dialogueContainer.scrollTop = dialogueContainer.scrollHeight;

        if (i >= text.length) {
            clearInterval(interval);
            if (callback) callback(); // 타이핑 완료 후 콜백 실행
        }
    }, 50); // 50ms 간격으로 타이핑
}

// 대화 내역 추가
function addToHistory(speaker, message) {
    const historyDiv = document.getElementById("historyContent");

    // 새로운 메시지를 아래쪽에 추가
    const newMessage = document.createElement("p");
    newMessage.innerHTML = `<strong>${speaker}:</strong> ${message.replace(/\n/g, "<br>")}`;
    historyDiv.appendChild(newMessage);

    // 스크롤을 항상 최신 메시지로 이동
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// 대화 내역 표시/숨기기
function toggleHistory() {
    const historyDiv = document.getElementById("history");
    if (historyDiv.style.display === "none" || historyDiv.style.display === "") {
        historyDiv.style.display = "block";
    } else {
        historyDiv.style.display = "none";
    }
}

// 게임 초기화
function restartGame() {
    currentPath = "start";
    historyContent = [];
    lastChoice = "기본 이름";

    // 대화 내역 초기화
    const historyDiv = document.getElementById("historyContent");
    historyDiv.innerHTML = "";

    // 저장된 슬롯 초기화
    for (let i = 1; i <= 4; i++) {
        localStorage.removeItem(`slot${i}`);
    }

    updateDialogue();
    alert("게임이 초기화되었습니다. 모든 슬롯이 초기화되었습니다.");
}

// 저장 UI 표시
function showSaveUI() {
    const saveDiv = document.getElementById("saveSlots");
    saveDiv.innerHTML = "";

    for (let i = 1; i <= 4; i++) {
        const slotName = localStorage.getItem(`slot${i}`)
            ? `슬롯 ${i}: ${JSON.parse(localStorage.getItem(`slot${i}`)).lastChoice}`
            : `슬롯 ${i}: 빈 슬롯`;
        const button = document.createElement("button");
        button.innerText = slotName;
        button.onclick = () => saveGame(i);
        saveDiv.appendChild(button);
    }

    openModal("saveModal");
}

// 불러오기 UI 표시
function showLoadUI() {
    const loadDiv = document.getElementById("loadSlots");
    loadDiv.innerHTML = "";

    for (let i = 1; i <= 4; i++) {
        const slotName = localStorage.getItem(`slot${i}`)
            ? `슬롯 ${i}: ${JSON.parse(localStorage.getItem(`slot${i}`)).lastChoice}`
            : `슬롯 ${i}: 빈 슬롯`;
        const button = document.createElement("button");
        button.innerText = slotName;
        button.onclick = () => loadGame(i);
        loadDiv.appendChild(button);
    }

    openModal("loadModal");
}

// 저장 기능
function saveGame(slot) {
    const saveData = {
        path: currentPath,
        lastChoice: lastChoice
    };
    localStorage.setItem(`slot${slot}`, JSON.stringify(saveData));
    alert(`슬롯 ${slot}에 저장되었습니다.`);
}

// 불러오기 기능
function loadGame(slot) {
    const saveData = localStorage.getItem(`slot${slot}`);
    if (saveData) {
        const parsedData = JSON.parse(saveData);
        currentPath = parsedData.path;
        lastChoice = parsedData.lastChoice;
        updateDialogue();
        alert(`슬롯 ${slot}에서 불러왔습니다.`);
    } else {
        alert("저장된 데이터가 없습니다.");
    }
}

// 테마 전환
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");

    document.body.style.color = isDark ? "#f0f0f0" : "#121212";

    document.querySelectorAll(".choice, .menu button, .modal-content button").forEach(button => {
        button.style.color = isDark ? "#f0f0f0" : "#121212";
        button.style.backgroundColor = isDark ? "#444" : "#007bff";
        button.style.borderColor = isDark ? "#555" : "#0056b3";
    });

    const dialogueBox = document.querySelector(".dialogue-box");
    dialogueBox.style.backgroundColor = isDark ? "#333" : "#f9f9f9";
    dialogueBox.style.color = isDark ? "#dcdcdc" : "#121212";

    const historyBox = document.getElementById("history");
    historyBox.style.backgroundColor = isDark ? "#333" : "#f9f9f9";
    historyBox.style.color = isDark ? "#dcdcdc" : "#121212";
}

// 모달 열기/닫기
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// 초기화
window.onload = function () {
    updateDialogue();
};
