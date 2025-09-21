import creditText from "../content/creditText.js";
import { gameState } from "../state/stateManagers.js";
import { colorizeBackground } from "../utils.js";

export default function credits(k) {
    colorizeBackground(k, 20, 20, 40); // 어두운 배경

    // HTML 크레딧 컨테이너 생성
    const creditsContainer = document.createElement("div");
    creditsContainer.style.position = "fixed";
    creditsContainer.style.top = "0";
    creditsContainer.style.left = "0";
    creditsContainer.style.width = "100%";
    creditsContainer.style.height = "100%";
    creditsContainer.style.backgroundColor = "rgba(20, 20, 40, 0.95)";
    creditsContainer.style.color = "white";
    creditsContainer.style.fontFamily = "gameboy, monospace";
    creditsContainer.style.fontSize = "43px";
    creditsContainer.style.textAlign = "center";
    creditsContainer.style.zIndex = "1000";
    creditsContainer.style.overflow = "hidden";
    creditsContainer.style.display = "flex";
    creditsContainer.style.flexDirection = "column";
    creditsContainer.style.justifyContent = "center";
    creditsContainer.style.alignItems = "center";

    // 크레딧 텍스트 컨테이너
    const textContainer = document.createElement("div");
    textContainer.style.animation = "scrollUp 17.6s linear infinite";
    textContainer.style.whiteSpace = "pre-line";
    textContainer.style.lineHeight = "1.8";
    textContainer.style.position = "absolute";
    textContainer.style.top = "100vh";
    textContainer.style.width = "100%";

    // CSS 애니메이션과 웹폰트 정의
    const style = document.createElement("style");
    style.textContent = `
        @font-face {
            font-family: 'gameboy';
            src: url('./assets/fonts/gb.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        
        @keyframes scrollUp {
            0% { 
                transform: translateY(0);
            }
            100% { 
                transform: translateY(-200vh);
            }
        }
    `;
    document.head.appendChild(style);

    // 빈 문자열을 제거하고 유효한 텍스트만 사용
    const validCredits = creditText.english.filter(
        (line) => line && line.trim() !== ""
    );

    // 크레딧 텍스트 생성
    let creditText_html = "";
    let previousWasSectionTitle = false;

    validCredits.forEach((line) => {
        const isSectionTitle = [
            "Project Lead",
            "Planning",
            "Tech Lead & Game Level Design",
            "Art Lead",
            "Music & Sound",
            "Story & Planning",
            "Special Thanks",
            "Tools Used",
            "Libraries & Assets",
            "Thank you for playing!",
        ].includes(line);

        if (
            isSectionTitle &&
            previousWasSectionTitle === false &&
            creditText_html !== ""
        ) {
            creditText_html += `<div style="height: 40px;"></div>`;
        }

        if (line === "After School RPG") {
            creditText_html += `<div style="font-size: 86px; margin: 20px 0; font-weight: bold;">${line}</div>`;
        } else if (line === "Gong Dong Chae Presents") {
            creditText_html += `<div style="font-size: 58px; margin: 20px 0; color: #ffc0cb;">${line}</div>`;
        } else if (isSectionTitle) {
            creditText_html += `<div style="font-size: 50px; margin: 15px 0; color: #ffc0cb; font-weight: bold;">${line}</div>`;
        } else {
            creditText_html += `<div style="font-size: 43px; margin: 10px 0;">${line}</div>`;
        }

        previousWasSectionTitle = isSectionTitle;
    });

    textContainer.innerHTML = creditText_html;
    creditsContainer.appendChild(textContainer);

    // 하단 안내 텍스트
    const instructionDiv = document.createElement("div");
    instructionDiv.style.position = "absolute";
    instructionDiv.style.bottom = "30px";
    instructionDiv.style.width = "100%";
    instructionDiv.style.fontSize = "29px";
    instructionDiv.style.color = "#999";
    instructionDiv.style.fontFamily = "gameboy, monospace";
    instructionDiv.textContent = "Press SPACE to return";
    creditsContainer.appendChild(instructionDiv);

    // DOM에 추가
    document.body.appendChild(creditsContainer);

    // 정리 함수
    function cleanup() {
        if (creditsContainer && creditsContainer.parentNode) {
            creditsContainer.parentNode.removeChild(creditsContainer);
        }
        if (style && style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }

    // 이전 씬 정보 가져오기 (현재 씬이 'current'인 경우 title로 기본값 설정)
    let previousScene = gameState.getPreviousScene() || "title";
    if (previousScene === "current" || previousScene === "credits") {
        previousScene = "title";
    }
    console.log(`[DEBUG] Credits - 이전 씬: ${previousScene}`);

    // 17.6초 후 자동으로 이전 씬으로 돌아가기
    const autoReturnTimer = setTimeout(() => {
        cleanup();
        k.go(previousScene);
    }, 17600);

    // 스페이스바로 언제든 이전 씬으로 돌아가기
    const spaceHandler = () => {
        console.log(`[DEBUG] 스페이스 키 눌림 - Credits에서 ${previousScene}로 돌아감`);
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    };
    
    k.onKeyPress("space", spaceHandler);
    
    // ESC 키로도 돌아가기
    k.onKeyPress("escape", () => {
        console.log(`[DEBUG] ESC 키 눌림 - Credits에서 ${previousScene}로 돌아감`);
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    });
    
    // ENTER 키로도 돌아가기
    k.onKeyPress("enter", () => {
        console.log(`[DEBUG] ENTER 키 눌림 - Credits에서 ${previousScene}로 돌아감`);
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    });
    
    // 브라우저 레벨 키 이벤트 처리 (한글 키 문제 해결용)
    let documentKeyHandler = (e) => {
        console.log(`[DEBUG] Credits 브라우저 키 이벤트: ${e.code}, ${e.key}`);
        
        if (e.type === 'keydown') {
            // 스페이스, ESC, 엔터 키 처리
            if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                e.preventDefault();
                console.log(`[DEBUG] ${e.code} 키로 Credits 종료`);
                clearTimeout(autoReturnTimer);
                cleanup();
                // 키 이벤트 리스너 제거
                document.removeEventListener('keydown', documentKeyHandler);
                k.go(previousScene);
            }
        }
    };
    
    // 브라우저 레벨 키 이벤트 등록
    document.addEventListener('keydown', documentKeyHandler);

    // 게임패드로도 이전 씬으로 돌아가기
    k.onGamepadButtonPress("east", () => {
        // A버튼
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    });

    k.onGamepadButtonPress("south", () => {
        // B버튼
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    });

    k.onGamepadButtonPress("start", () => {
        clearTimeout(autoReturnTimer);
        cleanup();
        k.go(previousScene);
    });
    
    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 Credits 씬 정리");
        clearTimeout(autoReturnTimer);
        cleanup();
        // 키 이벤트 리스너 제거
        if (documentKeyHandler) {
            document.removeEventListener('keydown', documentKeyHandler);
        }
    });
}
