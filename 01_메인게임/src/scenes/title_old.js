import { gameState } from "../state/stateManagers.js";
import { fadeInBGM, colorizeBackground, audioManager } from "../utils.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import { createPanelWithHeader, createCloseButton, UI_THEMES } from "../uiComponents/nineSlicePanel.js";

export default function title(k) {
    // 상호작용 및 게임 시작 제어 변수
    let canInteract = false;
    let gameStartTriggered = false;
    
    // 배경을 검은색으로 초기화 (뒷배경은 검은색)
    colorizeBackground(k, 0, 0, 0);

    // 씬 시작 시 검은색에서 페이드 인
    const fadeIn = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(1),
        k.z(100), // z-index 낮춤
        k.fixed(),
    ]);
    
    // 페이드 인 애니메이션
    k.tween(fadeIn.opacity, 0, 1.5, (val) => { // 시간 단축
        fadeIn.opacity = val;
    }).then(() => {
        console.log('🎬 Title 페이드인 완료 - 오버레이 제거');
        fadeIn.destroy();
    });

    // BGM 재생 (JavaScript 오디오 사용)
    console.log("🎵 BGM 상태 확인:", audioManager.isBGMPlaying(), audioManager.getCurrentBGM());
    
    // 기존 Kaboom BGM 정지 (충돌 방지)
    try {
        if (gameState.getBgmHandle && gameState.getBgmHandle()) {
            gameState.getBgmHandle().stop();
            console.log("🔇 기존 Kaboom BGM 정지");
        }
    } catch (error) {
        console.log("기존 BGM 정지 시 오류 (무시):", error);
    }
    
    if (!audioManager.isBGMPlaying() || audioManager.getCurrentBGM() !== "title-bgm") {
        console.log("🎵 새로운 BGM 재생 시작");
        const bgmResult = audioManager.playBGM("title-bgm", 1.0);
        if (bgmResult) {
            console.log("🎵 BGM 재생 완료");
        } else {
            console.error("🎵 BGM 재생 실패");
        }
        gameState.isMainMenuBGMPlaying = true;
    } else {
        console.log("🎵 BGM 이미 재생 중");
    }

    // 문서 배경도 검은색으로 설정 (뒷배경은 검은색)
    document.body.style.backgroundColor = 'black';

    // Title 화면 구성 (Kaboom.js 사용)
    const titleImg = k.add([
        k.sprite("title_01_bg"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.scale(1),
        k.z(1),
    ]);

    // Press to Start 버튼
    const startButton = k.add([
        k.sprite("title_button_notpressed"),
        k.pos(k.width() / 2, k.height() / 2 + 200),
        k.anchor("center"),
        k.scale(1),
        k.z(2),
        k.area(),
        "startButton",
    ]);

    // 마우스 호버 효과
    startButton.onHover(() => {
        startButton.use(k.sprite("title_button_pressed"));
    });

    startButton.onHoverEnd(() => {
        startButton.use(k.sprite("title_button_notpressed"));
    });

    // 클릭 시 프롤로그로 이동
    startButton.onClick(() => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        
        // 페이드 아웃 효과
        const fadeOut = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(0, 0, 0),
            k.opacity(0),
            k.z(100),
            k.fixed(),
        ]);

        k.tween(fadeOut.opacity, 1, 1, (val) => {
            fadeOut.opacity = val;
        }).then(() => {
            k.go("prologue");
        });
    });

    // Enter 키나 스페이스바로도 시작 가능
    k.onKeyPress("enter", () => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        k.go("prologue");
    });

    k.onKeyPress("space", () => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        k.go("prologue");
    });
        
        canvas.width = windowWidth;
        canvas.height = windowHeight;
        
        // 전체화면에서 Canvas 강제 재설정
        canvas.style.position = 'fixed';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.width = windowWidth + 'px';
        canvas.style.height = windowHeight + 'px';
        canvas.style.zIndex = '10000';
        canvas.style.display = 'block';
        canvas.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        
        console.log('🖥️ Title Canvas 크기 조정:', windowWidth, 'x', windowHeight, 'scale:', scale);
        console.log('🖥️ Canvas element:', canvas, 'ctx:', ctx);
        console.log('🖥️ Canvas style:', canvas.style.cssText);
    }
    
    // Canvas는 화면 전체 크기로 설정
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    canvas.setAttribute('data-title', 'true'); // CSS 선택자용 속성 추가
    console.log('🎨 초기 Canvas 생성:', windowWidth, 'x', windowHeight);
    console.log('🎨 Canvas element:', canvas);
    
    // 캔버스를 화면 전체에 배치
    canvas.style.position = 'fixed'; // absolute에서 fixed로 변경
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '15000'; // 더 높은 z-index로 설정
    canvas.style.pointerEvents = 'none';
    canvas.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'; // 디버깅용 빨간 배경 (투명도 10%)
    console.log('🎨 Canvas 스타일 설정 완료:', canvas.style.cssText);
    document.body.appendChild(canvas);
    console.log('🎨 Canvas DOM에 추가 완료');
    console.log('🎨 Document body children count:', document.body.children.length);
    
    ctx = canvas.getContext('2d'); // ctx 할당
    console.log('🎨 Canvas context 생성:', ctx);
    
    // Canvas 상태 확인
    console.log('🎨 Canvas 최종 상태:');
    console.log('  - 크기:', canvas.width, 'x', canvas.height);
    console.log('  - 위치:', canvas.style.position, canvas.style.top, canvas.style.left);
    console.log('  - z-index:', canvas.style.zIndex);
    console.log('  - 배경색:', canvas.style.backgroundColor);
    console.log('  - 부모:', canvas.parentElement);
    
    // 전체화면 상태 변경 감지
    const fullscreenChangeHandler = () => {
        console.log('🖥️ Title - 전체화면 상태 변경 감지');
        console.log('🖥️ fullscreenElement:', document.fullscreenElement);
        console.log('🖥️ webkitFullscreenElement:', document.webkitFullscreenElement);
        
        setTimeout(() => {
            resizeCanvas();
            
            // 전체화면에서 Canvas 완전히 재설정
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                console.log('🖥️ 전체화면 모드 - Canvas 완전 재설정');
                
                // Canvas를 DOM에서 제거 후 다시 추가
                if (canvas.parentElement) {
                    canvas.parentElement.removeChild(canvas);
                }
                
                // 전체화면 크기로 재생성
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                canvas.setAttribute('data-title', 'true'); // CSS 선택자용 속성 추가
                canvas.style.cssText = `
                    position: fixed !important;
                    top: 0px !important;
                    left: 0px !important;
                    width: ${window.innerWidth}px !important;
                    height: ${window.innerHeight}px !important;
                    z-index: 15000 !important;
                    pointer-events: none !important;
                    background-color: rgba(255, 0, 0, 0.1) !important;
                    display: block !important;
                `;
                
                document.body.appendChild(canvas);
                
                // Context 다시 가져오기
                ctx = canvas.getContext('2d');
                
                console.log('🖥️ Canvas 완전 재설정 완료');
                console.log('🖥️ 새 Canvas 크기:', canvas.width, 'x', canvas.height);
                console.log('🖥️ 새 Canvas 스타일:', canvas.style.cssText);
            }
        }, 200);
    };
    
    // 창 크기 변경 감지
    const resizeHandler = () => {
        console.log('🖥️ Title - 창 크기 변경 감지');
        resizeCanvas();
    };
    
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    window.addEventListener('resize', resizeHandler);
    
    // 씬 종료 플래그
    let sceneDestroyed = false;
    
    // 씬 종료 시 이벤트 리스너 제거 - k.onDestroy 대신 직접 관리
    const cleanupTitle = () => {
        if (sceneDestroyed) {
            console.log('🔄 Title 씬 이미 정리됨 - 중복 호출 무시');
            return;
        }
        
        console.log('🔄 Title 씬 종료 - Canvas 정리');
        sceneDestroyed = true;
        document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
        document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('beforeunload', cleanupTitle);
        if (canvas && canvas.parentElement) {
            canvas.parentElement.removeChild(canvas);
            console.log('🔄 Title Canvas DOM에서 제거됨');
        }
    };
    
    // 윈도우 종료 시 정리
    window.addEventListener('beforeunload', cleanupTitle);
    
    // k.onDestroy는 이벤트 리스너만 정리
    k.onDestroy(() => {
        console.log('🔄 Title 씬 Kaboom 오브젝트 정리 - Canvas 유지');
        document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
        document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('beforeunload', cleanupTitle);
    });
    
    // DOM에서 모든 Canvas 요소 확인
    setTimeout(() => {
        const allCanvases = document.querySelectorAll('canvas');
        console.log('🎨 DOM에 있는 모든 Canvas 요소:', allCanvases.length);
        allCanvases.forEach((c, i) => {
            console.log(`  Canvas ${i}:`, c.width + 'x' + c.height, 'z-index:', c.style.zIndex, 'display:', c.style.display || 'default');
        });
    }, 500);
    
    // 검은색 배경으로 완전히 덮기 (뒷배경은 검은색)
    const backgroundRect = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0), // 검은색으로 변경
        k.z(-1), // 가장 뒤에 배치
    ]);

    // 레이어 이미지들 로드 및 설정
    const layers = [
        { name: "title_01_bg", delay: 0, type: "fade", opacity: 0, scale: 1 },
        { name: "title_02_star", delay: 800, type: "fade", opacity: 0, scale: 1 },
        { name: "title_03_mini", delay: 1600, type: "scale", opacity: 0, scale: 0.1 },
        { name: "title_04_large", delay: 3200, type: "slide", opacity: 0, scale: 1, offsetY: 50 },
        { name: "title_05_cha_01", delay: 3800, type: "fade", opacity: 0, scale: 1 },
        { name: "title_06_cha_02", delay: 4000, type: "fade", opacity: 0, scale: 1 },
        { name: "title_07_cha_03", delay: 4200, type: "fade", opacity: 0, scale: 1 },
        { name: "title_08_cha_04", delay: 4400, type: "fade", opacity: 0, scale: 1 },
        { name: "title_09_cha_05", delay: 4600, type: "fade", opacity: 0, scale: 1 },
        { name: "title_10_cha_06", delay: 4800, type: "fade", opacity: 0, scale: 1 },
        { name: "title_11_cha_07", delay: 5000, type: "fade", opacity: 0, scale: 1 },
        { name: "title_12_cha_08", delay: 5200, type: "fade", opacity: 0, scale: 1 },
        { name: "title_13_cha_09", delay: 5400, type: "fade", opacity: 0, scale: 1 },
        { name: "title_14_cha_10", delay: 5600, type: "fade", opacity: 0, scale: 1 },
        { name: "title_15_cha_11", delay: 5800, type: "fade", opacity: 0, scale: 1 },
        { name: "title_16_cha_12", delay: 6000, type: "fade", opacity: 0, scale: 1 },
        { name: "title_17_cha_13", delay: 6200, type: "fade", opacity: 0, scale: 1 },
        { name: "title_18_cha_14", delay: 6400, type: "fade", opacity: 0, scale: 1 },
        { name: "title_19_cha_15", delay: 6600, type: "fade", opacity: 0, scale: 1 },
        { name: "title_20_cha_16", delay: 6800, type: "fade", opacity: 0, scale: 1 }
    ];

    // 이미지 로딩
    const images = {};
    let loadedCount = 0;
    
    function loadImages() {
        layers.forEach(layer => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                console.log(`이미지 로드 완료: ${layer.name} (${img.width}x${img.height})`);
                if (loadedCount === layers.length + 1) { // +1은 버튼 이미지
                    startAnimations();
                }
            };
            img.src = `assets/images/titles/${layer.name}.png`;
            images[layer.name] = img;
        });
        
        // PRESS TO START 버튼 이미지도 로드
        const buttonImg = new Image();
        buttonImg.onload = () => {
            loadedCount++;
            console.log(`버튼 이미지 로드 완료: (${buttonImg.width}x${buttonImg.height})`);
            if (loadedCount === layers.length + 1) {
                startAnimations();
            }
        };
        buttonImg.src = `assets/images/titles/title_button_notpressed.png`;
        images['button'] = buttonImg;
    }

    // Canvas 렌더링 함수
    function render() {
        // ctx가 유효한지 확인
        if (!ctx || !canvas) {
            console.warn("⚠️ Canvas 또는 Context가 없어서 렌더링 건너뜀");
            requestAnimationFrame(render);
            return;
        }
        
        try {
            // Canvas 상태 주기적 체크 (10초마다)
            if (Date.now() % 10000 < 16) {
                console.log('🎨 렌더링 중 Canvas 상태:');
                console.log('  - Canvas 크기:', canvas.width, 'x', canvas.height);
                console.log('  - Canvas visible:', canvas.style.display !== 'none');
                console.log('  - Canvas z-index:', canvas.style.zIndex);
                console.log('  - Canvas 위치:', canvas.style.position, canvas.style.top, canvas.style.left);
                console.log('  - 전체화면 상태:', !!(document.fullscreenElement || document.webkitFullscreenElement));
                console.log('  - Layers with opacity > 0:', layers.filter(l => l.opacity > 0).length);
                console.log('  - 렌더링할 이미지 수:', Object.keys(images).length);
            }
            
            // Canvas 배경을 완전히 지우기
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 🔴 테스트: 전체 화면을 검은색으로 채우기 (임시 주석)
            // ctx.fillStyle = 'black';
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 🔴 테스트 렌더링 - Canvas가 제대로 그려지는지 확인
            ctx.fillStyle = 'blue';
            ctx.fillRect(100, 100, 200, 200);
            ctx.fillStyle = 'yellow';
            ctx.fillRect(canvas.width - 300, 100, 200, 200);
            ctx.fillStyle = 'green';
            ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 100, 200, 200);
            console.log('🔴 테스트 도형 그리기 완료 - Canvas 크기:', canvas.width, 'x', canvas.height);
            
            layers.forEach(layer => {
                if (layer.opacity > 0 && images[layer.name]) {
                    const img = images[layer.name];
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    
                    ctx.save();
                    ctx.globalAlpha = layer.opacity;
                    
                    // 이미지를 캔버스 크기에 맞춰 스케일링
                    const imgScale = scale * layer.scale;
                    const drawWidth = img.width * imgScale;
                    const drawHeight = img.height * imgScale;
                    const drawX = centerX - drawWidth / 2;
                    const drawY = centerY - drawHeight / 2 + (layer.offsetY || 0) * scale;
                    
                    // 첫 번째 이미지 렌더링 시 디버깅 정보 출력
                    if (layer.name === "title_01_bg" && Date.now() % 5000 < 16) {
                        console.log('🎨 이미지 렌더링 디버깅:');
                        console.log('  - Layer:', layer.name, 'opacity:', layer.opacity);
                        console.log('  - Canvas 크기:', canvas.width, 'x', canvas.height);
                        console.log('  - 이미지 원본:', img.width, 'x', img.height);
                        console.log('  - 스케일:', imgScale, '(기본:', scale, '레이어:', layer.scale, ')');
                        console.log('  - 그리기 크기:', drawWidth, 'x', drawHeight);
                        console.log('  - 그리기 위치:', drawX, ',', drawY);
                        console.log('  - 중심점:', centerX, ',', centerY);
                    }
                    
                    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                    ctx.restore();
                }
            });
            
            // PRESS TO START 버튼 렌더링
            if (buttonOpacity > 0 && images['button']) {
                const img = images['button'];
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2 + 200 * scale + buttonOffsetY * scale; // 위아래 움직임 적용
                
                ctx.save();
                ctx.globalAlpha = buttonOpacity;
                
                const imgScale = scale * buttonScale;
                const drawWidth = img.width * imgScale;
                const drawHeight = img.height * imgScale;
                const drawX = centerX - drawWidth / 2;
                const drawY = centerY - drawHeight / 2;
                
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();
            }
        } catch (error) {
            console.error("❌ 렌더링 중 오류:", error);
        }
        
        requestAnimationFrame(render);
    }

    // 버튼 상태
    let buttonOpacity = 0;
    let buttonScale = 0.1;
    let buttonOffsetY = 0; // 버튼의 위아래 움직임을 위한 변수 추가

    // 순수 JavaScript 애니메이션 함수들
    function animateOpacity(layer, from, to, duration, callback) {
        const startTime = performance.now();
        layer.opacity = from;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 더 부드러운 easing 함수 (ease-out cubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            layer.opacity = from + (to - from) * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                layer.opacity = to;
                if (callback) callback();
            }
        }
        requestAnimationFrame(animate);
    }

    function animateScale(layer, from, to, duration, callback) {
        const startTime = performance.now();
        layer.scale = from;
        layer.opacity = 1;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let easedProgress;
            if (progress < 0.5) {
                easedProgress = 2 * progress * progress;
            } else {
                easedProgress = 1 - Math.pow(-2 * progress + 2, 2) / 2;
            }
            
            layer.scale = from + (to - from) * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                layer.scale = to;
                if (callback) callback();
            }
        }
        requestAnimationFrame(animate);
    }

    function animateSlide(layer, distance, duration, callback) {
        const startTime = performance.now();
        layer.offsetY = distance;
        layer.opacity = 0; // 시작할 때 투명하게

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 슬라이드는 기존 easing 유지
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            layer.offsetY = distance * (1 - easedProgress);
            
            // 페이드는 더 부드럽게 (quadratic ease-out)
            const fadeProgress = 1 - Math.pow(1 - progress, 2);
            layer.opacity = fadeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                layer.offsetY = 0;
                layer.opacity = 1;
                if (callback) callback();
            }
        }
        requestAnimationFrame(animate);
    }

    // 별 깜빡임 애니메이션 함수 (계속 반복)
    function animateStarTwinkle(layer, callback) {
        const startTime = performance.now();
        layer.opacity = 0;
        
        function twinkle(currentTime) {
            const elapsed = currentTime - startTime;
            const cycleTime = 3000; // 3초 주기
            const progress = (elapsed % cycleTime) / cycleTime;
            
            // 부드러운 sine wave 기반 깜빡임
            const sineValue = Math.sin(progress * Math.PI * 2);
            // 0.3에서 1.0 사이로 조정 (완전히 사라지지 않게)
            layer.opacity = 0.3 + 0.7 * (sineValue * 0.5 + 0.5);
            
            requestAnimationFrame(twinkle);
        }
        
        // 첫 페이드인 효과
        function initialFadeIn(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / 1000, 1); // 1초 동안 페이드인
            
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            layer.opacity = easedProgress * 0.8; // 최대 0.8까지
            
            if (progress < 1) {
                requestAnimationFrame(initialFadeIn);
            } else {
                if (callback) callback();
                requestAnimationFrame(twinkle); // 깜빡임 시작
            }
        }
        
        requestAnimationFrame(initialFadeIn);
    }

    // 애니메이션 시작
    function startAnimations() {
        console.log('🎬 Title 애니메이션 시작');
        console.log('🎬 현재 Canvas 상태:');
        console.log('  - Canvas 존재:', !!canvas);
        console.log('  - Context 존재:', !!ctx);
        console.log('  - Canvas 크기:', canvas.width, 'x', canvas.height);
        console.log('  - Canvas 부모:', canvas.parentElement);
        console.log('  - Canvas 표시됨:', canvas.style.display !== 'none');
        
        // 렌더링 시작
        render();
        
        layers.forEach((layer, index) => {
            setTimeout(() => {
                console.log(`Layer ${index + 1} (${layer.name}) 애니메이션 시작`);
                
                // title_02_star는 특별한 깜빡임 효과 적용
                if (layer.name === "title_02_star") {
                    animateStarTwinkle(layer, () => {
                        console.log(`Layer ${index + 1} 별 깜빡임 애니메이션 시작`);
                    });
                } else {
                    switch(layer.type) {
                        case "fade":
                            animateOpacity(layer, 0, 1, 1000, () => { // duration을 600에서 1000으로 증가
                                console.log(`Layer ${index + 1} 페이드인 완료`);
                            });
                            break;
                        case "scale":
                            animateScale(layer, 0.1, 1, 800, () => {
                                console.log(`Layer ${index + 1} 스케일인 완료`);
                            });
                            break;
                        case "slide":
                            animateSlide(layer, 50, 1000, () => { // duration을 800에서 1000으로 증가
                                console.log(`Layer ${index + 1} 슬라이드인 완료`);
                            });
                            break;
                    }
                }
            }, layer.delay);
        });

        // PRESS TO START 버튼 애니메이션
        setTimeout(() => {
            console.log("PRESS TO START 버튼 애니메이션 시작");
            animateButtonScale(0.1, 1, 600, () => {
                console.log("PRESS TO START 버튼 애니메이션 완료");
                startPulse();
            });
        }, 7300); // 6800 + 500ms 여유
    }

    function animateButtonScale(from, to, duration, callback) {
        const startTime = performance.now();
        buttonScale = from;
        buttonOpacity = 0; // 0에서 시작하도록 변경

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let easedProgress;
            if (progress < 0.5) {
                easedProgress = 2 * progress * progress;
            } else {
                easedProgress = 1 - Math.pow(-2 * progress + 2, 2) / 2;
            }
            
            buttonScale = from + (to - from) * easedProgress;
            buttonOpacity = easedProgress; // opacity도 같이 애니메이션

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                buttonScale = to;
                buttonOpacity = 1; // 최종값 확실히 설정
                if (callback) callback();
            }
        }
        requestAnimationFrame(animate);
    }

    // 펄스 효과
    function startPulse() {
        // 애니메이션 완료 후 상호작용 활성화
        canInteract = true;
        console.log("✅ Title 상호작용 활성화 - D키 사용 가능");
        
        const startTime = performance.now();
        
        function pulse(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = (elapsed % 3000) / 3000; // 3초 주기로 변경 (더 느리게)
            
            // 부드러운 fade 효과 (sine wave with easing)
            const fadePhase = Math.sin(progress * Math.PI * 2);
            const easedFade = 1 - Math.pow(1 - Math.abs(fadePhase), 2); // ease-out 적용
            buttonOpacity = 0.6 + 0.4 * easedFade;
            
            // 미세한 위아래 움직임 (다른 주기로)
            const moveProgress = (elapsed % 2000) / 2000; // 2초 주기
            buttonOffsetY = Math.sin(moveProgress * Math.PI * 2) * 3; // 3픽셀 정도의 미세한 움직임
            
            requestAnimationFrame(pulse);
        }
        requestAnimationFrame(pulse);
    }

    // 클릭 가능한 버튼 영역 (kaboom으로) - 스케일 적용
    const clickButton = k.add([
        k.rect(500 * scale, 120 * scale), // 버튼 영역을 더 크게
        k.pos(k.width() / 2, k.height() / 2 + 200 * scale), // 기본 위치 (미세한 움직임은 Canvas에서만)
        k.anchor("center"),
        k.area(),
        k.opacity(0), // 투명하지만 클릭 가능
        "clickable", // 태그 추가
    ]);

    // 버튼 클릭 이벤트는 startPulse()에서 canInteract가 활성화된 후 작동함

    // 마우스 클릭 이벤트
    clickButton.onClick(() => {
        console.log("🖱️ 마우스 클릭 감지됨!");
        if (!canInteract || gameStartTriggered || saveListPopupOpen) { // saveListPopupOpen 조건 추가
            console.log("❌ 아직 상호작용 불가능하거나 이미 처리됨 또는 팝업이 열려있음");
            return;
        }
        
        console.log("✅ 버튼 클릭됨!"); // 디버그용 로그 추가
        gameStartTriggered = true; // 중복 방지
        triggerGameStart();
    });

    // 마우스 호버 이벤트 (디버그용)
    clickButton.onHover(() => {
        console.log("🖱️ 버튼 영역에 마우스 호버됨");
    });

    // 게임 시작 함수
    function triggerGameStart() {
        console.log("🎮 게임 시작 트리거됨!");
        
        // BGM 볼륨을 40% 줄임 (JavaScript 오디오 사용)
        console.log("🔊 BGM 볼륨 조정 시도:", audioManager.isBGMPlaying(), audioManager.currentBGMElement?.volume);
        if (audioManager.isBGMPlaying()) {
            // 현재 볼륨에서 40% 감소
            const currentVolume = audioManager.currentBGMElement.volume;
            const targetVolume = Math.max(0, currentVolume * 0.6); // 현재 볼륨의 60%
            const success = audioManager.setBGMVolume(targetVolume);
            console.log(`🔊 BGM 볼륨 조정 ${success ? '성공' : '실패'}: ${currentVolume} → ${targetVolume}`);
        } else {
            console.warn("⚠️ BGM이 재생되지 않아서 볼륨 조정 불가");
        }
        
        // 클릭 효과
        const startTime = performance.now();
        let blinkCount = 0;
        
        function blinkEffect(currentTime) {
            const elapsed = currentTime - startTime;
            const blinkPhase = Math.floor(elapsed / 100);
            
            if (blinkPhase !== blinkCount && blinkPhase < 4) {
                buttonOpacity = blinkPhase % 2 === 0 ? 0 : 1;
                blinkCount = blinkPhase;
            }
            
            if (elapsed < 400) {
                requestAnimationFrame(blinkEffect);
            } else {
                // 효과음 재생 (볼륨 100%)
                k.play("confirm-beep-sfx", { volume: 1.0 });
                
                console.log("🌙 Title Fade Out 시작 (JavaScript)");
                
                // JavaScript로 페이드 아웃 효과 (Canvas와 HTML 동시)
                const fadeOutOverlay = document.createElement('div');
                fadeOutOverlay.style.position = 'fixed';
                fadeOutOverlay.style.top = '0';
                fadeOutOverlay.style.left = '0';
                fadeOutOverlay.style.width = '100vw';
                fadeOutOverlay.style.height = '100vh';
                fadeOutOverlay.style.backgroundColor = 'black';
                fadeOutOverlay.style.opacity = '0';
                fadeOutOverlay.style.zIndex = '10000';
                fadeOutOverlay.style.pointerEvents = 'none';
                fadeOutOverlay.style.transition = 'opacity 1.5s ease-out';
                document.body.appendChild(fadeOutOverlay);
                
                // 볼륨도 JavaScript로 페이드 아웃
                const startVolume = audioManager.currentBGMElement?.volume || 0;
                const targetVolume = startVolume * 0.8; // 80%까지만 감소
                
                // 페이드 아웃 시작
                setTimeout(() => {
                    fadeOutOverlay.style.opacity = '1';
                    
                    // 볼륨도 점진적으로 감소 (80%까지만)
                    if (audioManager.isBGMPlaying()) {
                        audioManager.fadeBGMVolume(targetVolume, 1500); // 1.5초 동안 페이드
                        console.log(`🔊 BGM 볼륨 페이드: ${startVolume.toFixed(2)} → ${targetVolume.toFixed(2)} (80%까지)`);
                    }
                }, 50);
                
                // 페이드 아웃 완료 후 다음 씬으로
                setTimeout(() => {
                    console.log("🌙 Title Fade Out 완료 - 검은 화면");
                    
                    // Canvas 제거
                    if (canvas && canvas.parentNode) {
                        document.body.removeChild(canvas);
                    }
                    
                    // 2초 후 다음 씬으로 전환
                    setTimeout(() => {
                        // 페이드 오버레이 제거
                        if (fadeOutOverlay && fadeOutOverlay.parentNode) {
                            document.body.removeChild(fadeOutOverlay);
                        }
                        
                        // BGM 볼륨 재조정 제거 - 이미 80%로 설정됨
                        console.log("🔊 BGM 볼륨 유지 (이미 80%로 설정됨)");
                        
                        gameState.isMainMenuBGMPlaying = false;
                        
                        // Canvas 정리 후 씬 전환
                        cleanupTitle();
                        
                        k.go("prologue");
                    }, 2000);
                }, 1500); // 페이드 아웃 완료까지 1.5초
            }
        }
        requestAnimationFrame(blinkEffect);
    }

    // ENTER 키나 SPACE 키로도 시작할 수 있게 추가
    k.onKeyPress("enter", () => {
        if (!canInteract || gameStartTriggered || saveListPopupOpen) { // saveListPopupOpen 조건 추가
            console.log("❌ ENTER: 아직 상호작용 불가능하거나 이미 처리됨 또는 팝업이 열려있음");
            return;
        }
        console.log("⌨️ ENTER 키 입력됨!");
        gameStartTriggered = true; // 중복 방지
        triggerGameStart();
    });

    k.onKeyPress("space", () => {
        if (!canInteract || gameStartTriggered || saveListPopupOpen) { // saveListPopupOpen 조건 추가
            console.log("❌ SPACE: 아직 상호작용 불가능하거나 이미 처리됨 또는 팝업이 열려있음");
            return;
        }
        console.log("⌨️ SPACE 키 입력됨!");
        gameStartTriggered = true; // 중복 방지
        triggerGameStart();
    });

    // ESC 키로 메뉴 이동 (title 씬으로 이동) - 비활성화
    k.onKeyPress("escape", () => {
        console.log('🔄 ESC 키 눌림 - title 씬에서는 무시');
        // title 씬에서는 ESC 키 무시 (무한 루프 방지)
        return;
        
        // Canvas가 존재하고 부모가 있는 경우에만 제거
        if (canvas && canvas.parentNode) {
            document.body.removeChild(canvas);
        }
        k.go("title");
    });

    // 저장된 게임 목록 팝업 상태
    let saveListPopup = null;
    let saveListPopupOpen = false;

    // D키로 저장된 게임 목록 팝업 열기 (한글, 대소문자 모두 지원)
    function handleDKeyPress() {
        if (!canInteract || gameStartTriggered) {
            console.log("❌ D키: 아직 상호작용 불가능하거나 이미 처리됨");
            return;
        }
        
        // 팝업이 이미 열려있으면 닫기
        if (saveListPopupOpen) {
            console.log("⌨️ D키 입력됨 - 저장된 게임 목록 닫기");
            closeSaveListPopup();
        } else {
            console.log("⌨️ D키 입력됨 - 저장된 게임 목록 열기");
            openSaveListPopup();
        }
    }
    
    // 소문자 d
    k.onKeyPress("d", handleDKeyPress);
    // 대문자 D (Shift+D 또는 Caps Lock)
    k.onKeyPress("D", handleDKeyPress);
    
    // X키로도 저장된 게임 목록 팝업 열기/닫기 (게임패드 X버튼과 연동)
    function handleXKeyPress() {
        if (!canInteract || gameStartTriggered) {
            console.log("❌ X키: 아직 상호작용 불가능하거나 이미 처리됨");
            return;
        }
        
        // 팝업이 이미 열려있으면 닫기
        if (saveListPopupOpen) {
            console.log("⌨️ X키 입력됨 - 저장된 게임 목록 닫기");
            closeSaveListPopup();
        } else {
            console.log("⌨️ X키 입력됨 - 저장된 게임 목록 열기");
            openSaveListPopup();
        }
    }
    
    // 소문자 x
    k.onKeyPress("x", handleXKeyPress);
    // 대문자 X (Shift+X 또는 Caps Lock)
    k.onKeyPress("X", handleXKeyPress);
    
    // 브라우저 키 이벤트로 한글 상태에서도 처리
    const titleKeyHandler = (e) => {
        // D키 (KeyD)가 눌렸는지 확인 (언어/대소문자 무관)
        if (e.code === 'KeyD') {
            handleDKeyPress();
        }
        // X키 (KeyX)가 눌렸는지 확인 (언어/대소문자 무관)
        if (e.code === 'KeyX') {
            handleXKeyPress();
        }
    };
    document.addEventListener('keydown', titleKeyHandler);

    // 게임패드 버튼 이벤트 추가
    // A 버튼 (east) - 게임 시작 또는 팝업에서 선택
    k.onGamepadButtonPress("east", () => {
        if (saveListPopupOpen) {
            // 팝업이 열려있을 때는 팝업 내 로직에서 처리
            console.log("🎮 게임패드 A: 팝업 내에서 처리됨");
            return;
        }
        
        if (!canInteract || gameStartTriggered) {
            console.log("❌ 게임패드 A: 아직 상호작용 불가능하거나 이미 처리됨");
            return;
        }
        console.log("🎮 게임패드 A 버튼 입력됨 - 게임 시작!");
        gameStartTriggered = true;
        triggerGameStart();
    });

    // B 버튼 (south) - 팝업 닫기
    k.onGamepadButtonPress("south", () => {
        if (saveListPopupOpen) {
            console.log("🎮 게임패드 B 버튼 입력됨 - 팝업 닫기");
            closeSaveListPopup();
        }
    });

    // Y 버튼 (west) - 이어하기 목록
    k.onGamepadButtonPress("west", () => {
        handleXKeyPress();
    });

    // 더미 데이터 생성 함수 (테스트용) - 실제 플레이어 데이터가 없을 때만
    function createTestDummyData() {
        try {
            // 기존 저장 데이터 확인
            const existingSaves = gameDataManager.getSaveList();
            
            // 실제 플레이어가 만든 데이터가 있는지 확인 (테스트가 아닌 데이터)
            const realPlayerData = existingSaves.filter(save => 
                save.playerName && 
                save.playerName !== "테스트" && 
                save.playerName.trim() !== "" &&
                save.gameState &&
                save.gameState.playerPosition
            );
            
            console.log("🔍 기존 저장 데이터 확인:", existingSaves.map(s => ({ name: s.playerName, scene: s.gameState?.currentScene })));
            console.log("🔍 실제 플레이어 데이터 수:", realPlayerData.length);
            
            // 실제 플레이어 데이터가 있으면 테스트 데이터 생성하지 않음
            if (realPlayerData.length > 0) {
                console.log("📋 실제 플레이어 데이터가 존재하므로 테스트 데이터 생성 안함");
                return;
            }
            
            // 테스트 데이터도 이미 있는지 확인
            const testSaveExists = existingSaves.some(save => save.playerName === "테스트");
            
            // 아무 데이터도 없을 때만 테스트 데이터 하나 생성
            if (!testSaveExists && existingSaves.length === 0) {
                console.log("🎯 저장 데이터가 전혀 없어서 테스트용 더미 데이터 1개 생성");
                
                const dummyData = gameDataManager.createSaveData("테스트");
                
                // 기본 스폰포인트 설정
                const defaultSpawnPoint = { x: 1200, y: 800 };
                
                dummyData.gameState.currentScene = "front";
                dummyData.gameState.playerPosition = defaultSpawnPoint;
                dummyData.gameState.playerDirection = "down";
                dummyData.gameState.health = 100;
                dummyData.gameState.inventory = [];
                dummyData.gameState.questsCompleted = [];
                dummyData.gameState.questsInProgress = [];
                dummyData.gameState.flags = {};
                dummyData.gameState.tutorialCompleted = true;
                dummyData.gameState.prologueCompleted = true;
                dummyData.gameState.introCompleted = true;
                
                dummyData.timestamp = new Date().toISOString();
                dummyData.lastPlayed = new Date().toISOString();
                
                const saveResult = gameDataManager.saveToBrowser(dummyData);
                console.log("✅ 테스트용 더미 데이터 저장 완료:", saveResult);
            } else {
                console.log("📋 이미 데이터가 존재하므로 테스트 데이터 생성 안함");
            }
        } catch (error) {
            console.error("❌ 더미 데이터 생성 실패:", error);
        }
    }

    // 저장된 게임 목록 팝업 열기 (front.js 퀘스트창 스타일)
    function openSaveListPopup() {
        if (saveListPopupOpen) return;
        
        console.log("🔍 저장된 게임 목록 팝업 열기");
        
        // 게임 시작 트리거 비활성화 (중요!)
        gameStartTriggered = true;
        console.log("🔒 게임 시작 트리거 잠금 (팝업 열림)");
        
        // 더미 데이터 생성 (테스트용)
        createTestDummyData();
        
        // Canvas를 완전히 제거 (팝업이 확실히 보이게)
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
            console.log("🔍 Canvas 완전 제거 완료");
        }
        
        // 배경색을 핑크색으로 변경
        document.body.style.backgroundColor = '#FFB6C1'; // 연한 핑크색
        
        saveListPopupOpen = true;
        const saveList = gameDataManager.getSaveList();
        
        // 타일맵 씬에서 플레이어가 생성된 저장 데이터만 필터링
        const validScenes = ["front", "schoolfront", "first", "second", "restroom", "garage", "restaurant"];
        const validSaveList = saveList.filter(save => {
            console.log("🔍 저장 데이터 필터링 체크:", {
                playerName: save.playerName,
                hasGameState: !!save.gameState,
                currentScene: save.gameState?.currentScene,
                hasPlayerPosition: !!save.gameState?.playerPosition,
                isValidScene: validScenes.includes(save.gameState?.currentScene)
            });
            
            return save.gameState && 
                   save.gameState.currentScene && 
                   validScenes.includes(save.gameState.currentScene) &&
                   save.gameState.playerPosition; // 플레이어 위치가 저장되어 있어야 함
        });
        
        console.log("🔍 저장된 게임 수:", saveList.length, "유효한 게임 수:", validSaveList.length);
        console.log("🔍 모든 저장 데이터:", saveList.map(s => ({ name: s.playerName, scene: s.gameState?.currentScene, pos: s.gameState?.playerPosition })));

        // 현재 언어 설정 가져오기
        const locale = gameState.getLocale();

        // 팝업 크기 (front.js와 완전 동일)
        const panelWidth = k.width() * 0.8;
        const panelHeight = k.height() * 0.7;
        const panelX = k.width() * 0.1;
        const panelY = k.height() * 0.15;
        
        // 파스텔 블루 테마로 패널 생성 (front.js와 완전 동일)
        const panel = createPanelWithHeader(k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30, // front.js와 동일
            colors: UI_THEMES.PASTEL_BLUE, // front.js와 동일한 테마
            zIndex: 150,
            tag: "save-list-popup",
            fixed: true
        });

        // 팝업 제목 (헤더 영역에 배치, front.js와 완전 동일)
        const title = k.add([
            k.text("게임 이어하기", {
                size: 20, // front.js와 동일한 크기
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2), // front.js와 동일한 위치
            k.color(80, 80, 80), // front.js와 동일한 색상 (파스텔 테마에 맞는 진한 회색)
            k.anchor("left"),
            k.z(155), // z-index를 조정
            k.fixed(),
            "save-list-popup",
        ]);

        // 저장된 게임이 없는 경우
        if (validSaveList.length === 0) {
            const noSaveText = "이어할 수 있는 게임이 없습니다.\n새 게임을 시작해주세요.";
            
            k.add([
                k.text(noSaveText, { 
                    size: 18, 
                    font: "galmuri",
                    align: "center"
                }),
                k.pos(panel.contentArea.x + panel.contentArea.width / 2, panel.contentArea.y + panel.contentArea.height / 2),
                k.anchor("center"),
                k.color(80, 80, 80), // front.js와 동일한 색상
                k.z(151),
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 저장된 게임이 없을 때도 클릭하면 닫히도록
            if (panel.mainBg && panel.mainBg.onClick) {
                panel.mainBg.onClick(() => {
                    closeSaveListPopup();
                });
            } else {
                // mainBg에 직접 클릭 이벤트 추가
                panel.elements.forEach(element => {
                    if (element.area && element.onClick) {
                        element.onClick(() => {
                            closeSaveListPopup();
                        });
                    }
                });
            }
        } else {
            // 저장된 게임 목록 표시 (스크롤바로 모든 항목 표시)
            const totalItems = validSaveList.length;
            
            // 스크롤 가능한 콘텐츠 영역 생성
            const scrollAreaHeight = panel.contentArea.height - 80; // 하단 안내 텍스트 공간 확보
            const itemHeight = 60;
            const maxVisibleItems = Math.floor(scrollAreaHeight / itemHeight);
            
            console.log(`📜 스크롤 영역: 총 ${totalItems}개 항목, 최대 표시 ${maxVisibleItems}개`);
            
            // 스크롤 상태
            let scrollOffset = 0;
            const maxScrollOffset = Math.max(0, totalItems - maxVisibleItems);
            
            // 스크롤바 필요 여부
            const needScrollbar = totalItems > maxVisibleItems;
            
            // 스크롤 가능 영역 배경
            const scrollArea = k.add([
                k.rect(panel.contentArea.width - (needScrollbar ? 30 : 10), scrollAreaHeight),
                k.pos(panel.contentArea.x + 5, panel.contentArea.y + 20),
                k.color(240, 245, 255),
                k.opacity(0.3),
                k.z(149),
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 렌더링 함수
            function renderSaveList() {
                // 기존 저장 항목들 제거
                k.get("save-item").forEach(item => item.destroy());
                
                // 현재 스크롤 위치에 따라 표시할 항목들
                const startIndex = scrollOffset;
                const endIndex = Math.min(startIndex + maxVisibleItems, totalItems);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const save = validSaveList[i];
                    const displayIndex = i - startIndex; // 화면상 위치
                    const lastPlayedDate = new Date(save.lastPlayedAt);
                    const playTimeText = gameDataManager.formatPlayTime(save.playTime.totalSeconds);
                    
                    const dateStr = lastPlayedDate.toLocaleDateString('ko-KR');
                    const timeStr = lastPlayedDate.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    const itemText = locale === "korean" 
                        ? `${i + 1}. ${save.playerName} - ${dateStr} ${timeStr} (${playTimeText})`
                        : `${i + 1}. ${save.playerName} - ${dateStr} ${timeStr} (${playTimeText})`;
                    
                    const itemY = panel.contentArea.y + 25 + (displayIndex * itemHeight);
                    
                    // 항목 배경
                    const itemBg = k.add([
                        k.rect(panel.contentArea.width - (needScrollbar ? 50 : 30), 50),
                        k.pos(panel.contentArea.x + 10, itemY - 5),
                        k.color(220, 230, 250),
                        k.opacity(0.7),
                        k.z(150),
                        k.fixed(),
                        "save-list-popup",
                        "save-item"
                    ]);
                    
                    // 텍스트
                    const itemTextElement = k.add([
                        k.text(itemText, {
                            size: 16,
                            font: "galmuri",
                            width: panel.contentArea.width - (needScrollbar ? 70 : 50)
                        }),
                        k.pos(panel.contentArea.x + 20, itemY + 10),
                        k.color(80, 80, 80),
                        k.z(152),
                        k.fixed(),
                        "save-list-popup",
                        "save-item"
                    ]);
                    
                    // 클릭 영역
                    const clickArea = k.add([
                        k.rect(panel.contentArea.width - (needScrollbar ? 50 : 30), 50),
                        k.pos(panel.contentArea.x + 10, itemY - 5),
                        k.area(),
                        k.opacity(0),
                        k.z(153),
                        k.fixed(),
                        "save-list-popup",
                        "save-item"
                    ]);
                    
                    // 호버 효과
                    clickArea.onHover(() => {
                        itemBg.color = k.rgb(200, 215, 240);
                        itemBg.opacity = 0.9;
                    });
                    
                    clickArea.onHoverEnd(() => {
                        itemBg.color = k.rgb(220, 230, 250);
                        itemBg.opacity = 0.7;
                    });
                    
                    clickArea.onClick(() => {
                        console.log(`🔍 저장 데이터 클릭: ${save.playerName}`);
                        k.wait(0.1, () => {
                            loadSaveData(save);
                        });
                    });
                }
            }
            
            // 스크롤바 생성 (필요한 경우)
            if (needScrollbar) {
                const scrollbarWidth = 20;
                const scrollbarHeight = scrollAreaHeight;
                const scrollbarX = panel.contentArea.x + panel.contentArea.width - 25;
                const scrollbarY = panel.contentArea.y + 20;
                
                // 스크롤바 배경
                k.add([
                    k.rect(scrollbarWidth, scrollbarHeight),
                    k.pos(scrollbarX, scrollbarY),
                    k.color(200, 200, 200),
                    k.z(151),
                    k.fixed(),
                    "save-list-popup"
                ]);
                
                // 스크롤바 핸들
                const handleHeight = Math.max(20, (maxVisibleItems / totalItems) * scrollbarHeight);
                let scrollbarHandle = null;
                
                function updateScrollbar() {
                    if (scrollbarHandle) scrollbarHandle.destroy();
                    
                    const handleY = scrollbarY + (scrollOffset / maxScrollOffset) * (scrollbarHeight - handleHeight);
                    
                    scrollbarHandle = k.add([
                        k.rect(scrollbarWidth - 4, handleHeight),
                        k.pos(scrollbarX + 2, handleY),
                        k.color(120, 140, 180),
                        k.z(152),
                        k.fixed(),
                        "save-list-popup"
                    ]);
                }
                
                updateScrollbar();
                
                // 스크롤 이벤트 (마우스 휠)
                k.onScroll((delta) => {
                    if (needScrollbar) {
                        const scrollStep = 1;
                        scrollOffset = Math.max(0, Math.min(maxScrollOffset, scrollOffset - delta.y * scrollStep));
                        renderSaveList();
                        updateScrollbar();
                    }
                });
                
                // 키보드 스크롤 (위/아래 화살표)
                k.onKeyPress("up", () => {
                    if (needScrollbar && scrollOffset > 0) {
                        scrollOffset--;
                        renderSaveList();
                        updateScrollbar();
                    }
                });
                
                k.onKeyPress("down", () => {
                    if (needScrollbar && scrollOffset < maxScrollOffset) {
                        scrollOffset++;
                        renderSaveList();
                        updateScrollbar();
                    }
                });

                // 게임패드 스크롤 (D패드 위/아래)
                k.onGamepadButtonPress("dpad-up", () => {
                    if (needScrollbar && scrollOffset > 0) {
                        scrollOffset--;
                        renderSaveList();
                        updateScrollbar();
                    }
                });
                
                k.onGamepadButtonPress("dpad-down", () => {
                    if (needScrollbar && scrollOffset < maxScrollOffset) {
                        scrollOffset++;
                        renderSaveList();
                        updateScrollbar();
                    }
                });
            }
            
            // 초기 렌더링
            renderSaveList();
            
            // 모든 저장 데이터 삭제 버튼
            const deleteAllButtonWidth = 150;
            const deleteAllButtonHeight = 35;
            const deleteAllButtonX = panel.contentArea.x + panel.contentArea.width - deleteAllButtonWidth - 20;
            const deleteAllButtonY = panel.contentArea.y + panel.contentArea.height - 70;
            
            // 삭제 버튼 배경
            const deleteAllButtonBg = k.add([
                k.rect(deleteAllButtonWidth, deleteAllButtonHeight),
                k.pos(deleteAllButtonX, deleteAllButtonY),
                k.color(220, 100, 100), // 연한 빨간색
                k.z(155), // z-index를 높여서 배경 클릭보다 우선하도록
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 삭제 버튼 텍스트
            const deleteAllButtonText = k.add([
                k.text("모든 데이터 삭제", {
                    size: 14,
                    font: "galmuri",
                    align: "center"
                }),
                k.pos(deleteAllButtonX + deleteAllButtonWidth / 2, deleteAllButtonY + deleteAllButtonHeight / 2),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(156), // 텍스트도 더 높게
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 삭제 버튼 클릭 영역
            const deleteAllButtonArea = k.add([
                k.rect(deleteAllButtonWidth, deleteAllButtonHeight),
                k.pos(deleteAllButtonX, deleteAllButtonY),
                k.area(),
                k.opacity(0),
                k.z(157), // 클릭 영역을 가장 높게
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 삭제 버튼 호버 효과
            deleteAllButtonArea.onHover(() => {
                deleteAllButtonBg.color = k.rgb(200, 80, 80);
            });
            
            deleteAllButtonArea.onHoverEnd(() => {
                deleteAllButtonBg.color = k.rgb(220, 100, 100);
            });
            
            // 삭제 버튼 클릭 이벤트
            deleteAllButtonArea.onClick(() => {
                console.log("🗑️ 삭제 버튼 클릭됨");
                // 이벤트 전파 방지를 위해 즉시 다이얼로그 표시
                showDeleteConfirmDialog();
                // 추가적인 클릭 이벤트 처리 방지
                return false;
            });
            
            // 클릭 안내 텍스트 (스크롤바 안내 포함)
            const instructionText = needScrollbar 
                ? "저장 데이터를 클릭하여 이어하기 | 마우스휠 또는 ↑↓ 키로 스크롤 | 아무 곳이나 클릭하면 닫힘"
                : "저장 데이터를 클릭하여 이어하기 또는 아무 곳이나 클릭하면 닫힘";
            
            k.add([
                k.text(instructionText, {
                    size: 14,
                    font: "galmuri",
                    align: "center"
                }),
                k.pos(panel.contentArea.x + panel.contentArea.width / 2, panel.contentArea.y + panel.contentArea.height - 40),
                k.anchor("center"),
                k.color(120, 120, 120), // 차분한 회색
                k.z(151),
                k.fixed(),
                "save-list-popup"
            ]);
            
            // 패널 배경 클릭 시 닫기 (저장 데이터가 아닌 곳 클릭)
            // 패널 전체에 대한 배경 클릭 영역을 명시적으로 생성
            const panelBackgroundClickArea = k.add([
                k.rect(panelWidth, panelHeight),
                k.pos(panelX, panelY),
                k.area(),
                k.opacity(0), // 투명하지만 클릭 가능
                k.z(140), // z-index를 더 낮게 설정하여 다른 버튼들이 우선하도록
                k.fixed(),
                "save-list-popup"
            ]);
            
            panelBackgroundClickArea.onClick(() => {
                console.log("🔍 패널 배경 클릭 - 팝업 닫기");
                closeSaveListPopup();
            });
            
            // 기존 panel.mainBg 처리도 유지
            if (panel.mainBg && panel.mainBg.onClick) {
                panel.mainBg.onClick(() => {
                    console.log("🔍 panel.mainBg 클릭 - 팝업 닫기");
                    closeSaveListPopup();
                });
            } else {
                // mainBg에 직접 클릭 이벤트 추가
                panel.elements.forEach(element => {
                    if (element.area && element.onClick) {
                        element.onClick(() => {
                            closeSaveListPopup();
                        });
                    }
                });
            }
        }

        // X 버튼 생성 (front.js와 완전 동일)
        const currentCloseButton = createCloseButton(k, {
            x: panel.headerArea.x + panel.headerArea.width - 28,
            y: panel.headerArea.y + 4,
            size: 22,
            colors: {
                bg: [120, 140, 180],
                bgHover: [140, 160, 200],
                border: [100, 120, 160],
                text: [255, 255, 255]
            },
            zIndex: 160, // z-index를 더 높게 설정
            fixed: true,
            tag: "save-list-popup",
            onClick: () => {
                closeSaveListPopup();
            }
        });

        // ESC 키로 팝업 닫기
        const escHandler = k.onKeyPress("escape", () => {
            closeSaveListPopup();
        });

        // 게임패드 B 버튼으로 팝업 닫기
        const gamepadBHandler = k.onGamepadButtonPress("south", () => {
            closeSaveListPopup();
        });

        // 팝업 참조 저장
        saveListPopup = {
            panel: panel,
            escHandler: escHandler,
            gamepadBHandler: gamepadBHandler,
            closeButton: currentCloseButton
        };
    }

    // 삭제 확인 다이얼로그 표시
    function showDeleteConfirmDialog() {
        console.log("🗑️ 삭제 확인 다이얼로그 표시");
        
        // 다이얼로그 크기 및 위치
        const dialogWidth = 400;
        const dialogHeight = 200;
        const dialogX = (k.width() - dialogWidth) / 2;
        const dialogY = (k.height() - dialogHeight) / 2;
        
        // 반투명 배경 오버레이
        const overlay = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(0, 0, 0),
            k.opacity(0.5),
            k.z(199),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        // 다이얼로그 패널
        const dialogPanel = createPanelWithHeader(k, {
            x: dialogX,
            y: dialogY,
            width: dialogWidth,
            height: dialogHeight,
            headerHeight: 30,
            colors: UI_THEMES.PASTEL_BLUE,
            zIndex: 200,
            tag: "delete-confirm-dialog",
            fixed: true
        });
        
        // 다이얼로그 제목
        k.add([
            k.text("데이터 삭제 확인", {
                size: 18,
                font: "galmuri",
            }),
            k.pos(dialogPanel.headerArea.x + 8, dialogPanel.headerArea.y + dialogPanel.headerArea.height / 2),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(205),
            k.fixed(),
            "delete-confirm-dialog",
        ]);
        
        // 확인 메시지
        const confirmMessage = "정말로 모든 저장 데이터를\n삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.";
        k.add([
            k.text(confirmMessage, {
                size: 16,
                font: "galmuri",
                align: "center",
                lineSpacing: 8
            }),
            k.pos(dialogPanel.contentArea.x + dialogPanel.contentArea.width / 2, dialogPanel.contentArea.y + 50),
            k.anchor("center"),
            k.color(80, 80, 80),
            k.z(205),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        // 버튼 크기 및 위치
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonY = dialogPanel.contentArea.y + dialogPanel.contentArea.height - 50;
        const noButtonX = dialogPanel.contentArea.x + dialogPanel.contentArea.width / 2 - buttonWidth - 10;
        const yesButtonX = dialogPanel.contentArea.x + dialogPanel.contentArea.width / 2 + 10;
        
        // "아니오" 버튼
        const noButtonBg = k.add([
            k.rect(buttonWidth, buttonHeight),
            k.pos(noButtonX, buttonY),
            k.color(150, 150, 150),
            k.z(205),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        const noButtonText = k.add([
            k.text("아니오", {
                size: 16,
                font: "galmuri",
                align: "center"
            }),
            k.pos(noButtonX + buttonWidth / 2, buttonY + buttonHeight / 2),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(206),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        const noButtonArea = k.add([
            k.rect(buttonWidth, buttonHeight),
            k.pos(noButtonX, buttonY),
            k.area(),
            k.opacity(0),
            k.z(207),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        // "예" 버튼
        const yesButtonBg = k.add([
            k.rect(buttonWidth, buttonHeight),
            k.pos(yesButtonX, buttonY),
            k.color(220, 100, 100),
            k.z(205),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        const yesButtonText = k.add([
            k.text("예", {
                size: 16,
                font: "galmuri",
                align: "center"
            }),
            k.pos(yesButtonX + buttonWidth / 2, buttonY + buttonHeight / 2),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(206),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        const yesButtonArea = k.add([
            k.rect(buttonWidth, buttonHeight),
            k.pos(yesButtonX, buttonY),
            k.area(),
            k.opacity(0),
            k.z(207),
            k.fixed(),
            "delete-confirm-dialog"
        ]);
        
        // 버튼 호버 효과
        noButtonArea.onHover(() => {
            noButtonBg.color = k.rgb(170, 170, 170);
        });
        
        noButtonArea.onHoverEnd(() => {
            noButtonBg.color = k.rgb(150, 150, 150);
        });
        
        yesButtonArea.onHover(() => {
            yesButtonBg.color = k.rgb(240, 120, 120);
        });
        
        yesButtonArea.onHoverEnd(() => {
            yesButtonBg.color = k.rgb(220, 100, 100);
        });
        
        // 버튼 클릭 이벤트
        noButtonArea.onClick(() => {
            console.log("🔍 삭제 취소됨");
            closeDeleteConfirmDialog();
        });
        
        yesButtonArea.onClick(() => {
            console.log("🗑️ 모든 데이터 삭제 확인됨");
            deleteAllSaveData();
            closeDeleteConfirmDialog();
        });
        
        // ESC 키로 취소
        const escHandler = k.onKeyPress("escape", () => {
            closeDeleteConfirmDialog();
        });
        
        // 다이얼로그 참조 저장
        window.deleteConfirmDialog = {
            escHandler: escHandler
        };
        
        // 다이얼로그 닫기 함수
        function closeDeleteConfirmDialog() {
            if (window.deleteConfirmDialog) {
                if (window.deleteConfirmDialog.escHandler) {
                    window.deleteConfirmDialog.escHandler.cancel();
                }
                window.deleteConfirmDialog = null;
            }
            k.destroyAll("delete-confirm-dialog");
        }
        
        // 모든 저장 데이터 삭제 함수
        function deleteAllSaveData() {
            try {
                console.log("🗑️ 모든 저장 데이터 삭제 시작");
                
                // gameDataManager를 통해 모든 저장 데이터 삭제
                const deleteResult = gameDataManager.deleteAllSaves();
                
                if (deleteResult) {
                    console.log("✅ 모든 저장 데이터 삭제 완료");
                    
                    // 성공 메시지 표시
                    showDeleteSuccessMessage();
                    
                    // 저장 목록 팝업 완전히 닫기
                    k.wait(1.5, () => {
                        console.log("🔍 삭제 완료 후 팝업 닫기");
                        closeSaveListPopup();
                    });
                } else {
                    console.error("❌ 저장 데이터 삭제 실패");
                    showDeleteErrorMessage();
                }
            } catch (error) {
                console.error("❌ 저장 데이터 삭제 중 오류:", error);
                showDeleteErrorMessage();
            }
        }
        
        // 삭제 성공 메시지
        function showDeleteSuccessMessage() {
            const successMessage = k.add([
                k.text("모든 저장 데이터가 삭제되었습니다", {
                    size: 16,
                    font: "galmuri",
                    align: "center"
                }),
                k.pos(k.width() / 2, k.height() / 2),
                k.anchor("center"),
                k.color(100, 180, 100),
                k.z(250),
                k.fixed(),
                "delete-success-message"
            ]);
            
            // 1.5초 후 메시지 제거
            k.wait(1.5, () => {
                k.destroyAll("delete-success-message");
            });
        }
        
        // 삭제 실패 메시지
        function showDeleteErrorMessage() {
            const errorMessage = k.add([
                k.text("저장 데이터 삭제에 실패했습니다", {
                    size: 16,
                    font: "galmuri",
                    align: "center"
                }),
                k.pos(k.width() / 2, k.height() / 2),
                k.anchor("center"),
                k.color(220, 100, 100),
                k.z(250),
                k.fixed(),
                "delete-error-message"
            ]);
            
            // 2초 후 메시지 제거
            k.wait(2, () => {
                k.destroyAll("delete-error-message");
            });
        }
    }

    // 저장된 게임 목록 팝업 닫기
    function closeSaveListPopup() {
        if (!saveListPopupOpen) return;
        
        console.log("🔍 팝업 닫기 시작");
        
        // 배경색을 검은색으로 복원
        document.body.style.backgroundColor = 'black';

        saveListPopupOpen = false;
        
        // 게임 시작 트리거 재활성화 (중요!)
        gameStartTriggered = false;
        console.log("🔓 게임 시작 트리거 잠금 해제 (팝업 닫힘)");

        // 팝업 요소들 제거
        if (saveListPopup) {
            if (saveListPopup.closeButton && saveListPopup.closeButton.destroy) {
                saveListPopup.closeButton.destroy();
            }
            if (saveListPopup.escHandler) {
                saveListPopup.escHandler.cancel();
            }
            if (saveListPopup.gamepadBHandler) {
                saveListPopup.gamepadBHandler.cancel();
            }
            k.destroyAll("save-list-popup");
            saveListPopup = null;
        }
        
        // Canvas를 다시 생성하여 원래 화면 복원
        recreateCanvas();
    }
    
    // Canvas 재생성 함수
    function recreateCanvas() {
        console.log("🔍 Canvas 재생성 시작");
        
        // 기존 Canvas가 남아있다면 제거
        const existingCanvas = document.querySelector('canvas[style*="position: fixed"]');
        if (existingCanvas && existingCanvas.parentNode) {
            existingCanvas.parentNode.removeChild(existingCanvas);
            console.log("🔍 기존 Canvas 제거 완료");
        }
        
        // 새로운 Canvas 생성 (원래 코드와 완전히 동일)
        const newCanvas = document.createElement('canvas');
        const originalWidth = 2563;
        const originalHeight = 1280;
        
        // 브라우저 창 크기에 맞춰 스케일 조정
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const scaleX = windowWidth / originalWidth;
        const scaleY = windowHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY);
        
        newCanvas.width = windowWidth;
        newCanvas.height = windowHeight;
        
        newCanvas.style.position = 'fixed';
        newCanvas.style.top = '0';
        newCanvas.style.left = '0';
        newCanvas.style.width = '100vw';
        newCanvas.style.height = '100vh';
        newCanvas.style.zIndex = '9999';
        newCanvas.style.pointerEvents = 'none';
        newCanvas.style.backgroundColor = 'black';
        newCanvas.style.display = 'block'; // 명시적으로 표시되도록 설정
        document.body.appendChild(newCanvas);
        
        // 전역 canvas 변수와 ctx 업데이트
        canvas = newCanvas;
        ctx = newCanvas.getContext('2d');
        
        console.log("✅ Canvas 재생성 완료, 크기:", newCanvas.width, "x", newCanvas.height);
        
        // 즉시 한 번 렌더링하여 화면에 표시
        render();
    }

    // 저장 데이터 로드 및 게임 시작
    function loadSaveData(saveData) {
        console.log(`[DEBUG] 저장 데이터 로드 시작: ${saveData.id}`);
        
        try {
            // 저장 데이터를 게임 상태에 로드
            const loadResult = gameDataManager.loadSaveData(saveData.id, gameState, null);
            
            if (loadResult) {
                console.log(`✅ 저장 데이터 로드 성공: ${saveData.playerName}`);
                
                // 팝업 닫기
                closeSaveListPopup();
                
                // 게임 시작 (저장된 씬으로 이동) - gameStartTriggered는 이미 팝업에서 설정됨
                const targetScene = saveData.gameState.currentScene || "front";
                
                // 페이드 아웃 효과와 함께 해당 씬으로 이동
                const fadeOutOverlay = document.createElement('div');
                fadeOutOverlay.style.position = 'fixed';
                fadeOutOverlay.style.top = '0';
                fadeOutOverlay.style.left = '0';
                fadeOutOverlay.style.width = '100vw';
                fadeOutOverlay.style.height = '100vh';
                fadeOutOverlay.style.backgroundColor = 'black';
                fadeOutOverlay.style.opacity = '0';
                fadeOutOverlay.style.zIndex = '10000';
                fadeOutOverlay.style.pointerEvents = 'none';
                fadeOutOverlay.style.transition = 'opacity 1.0s ease-out';
                document.body.appendChild(fadeOutOverlay);
                
                setTimeout(() => {
                    fadeOutOverlay.style.opacity = '1';
                }, 50);
                
                setTimeout(() => {
                    // Canvas 제거
                    if (canvas && canvas.parentNode) {
                        document.body.removeChild(canvas);
                    }
                    
                    // 페이드 오버레이 제거
                    if (fadeOutOverlay && fadeOutOverlay.parentNode) {
                        document.body.removeChild(fadeOutOverlay);
                    }
                    
                    console.log(`🎮 저장된 게임 로드 완료 - ${targetScene} 씬으로 이동`);
                    k.go(targetScene);
                }, 1000);
                
            } else {
                console.error("❌ 저장 데이터 로드 실패");
            }
        } catch (error) {
            console.error("❌ 저장 데이터 로드 중 오류:", error);
        }
    }

    // 이미지 로딩 시작
    loadImages();

    // 씬이 떠날 때 Canvas 정리 및 배경 복원
    k.onSceneLeave(() => {
        try {
            // 키 이벤트 리스너 제거
            if (titleKeyHandler) {
                document.removeEventListener('keydown', titleKeyHandler);
                console.log("✅ Title 키 이벤트 리스너 제거 완료");
            }
            
            // 저장 팝업 정리
            if (saveListPopupOpen) {
                closeSaveListPopup();
                console.log("✅ 저장 팝업 정리 완료");
            }
            
            if (canvas && canvas.parentNode) {
                document.body.removeChild(canvas);
                console.log("✅ Title 씬 종료 시 Canvas 정리 완료");
            }
            // 페이드 오버레이 정리 (혹시 남아있다면)
            const fadeOverlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
            fadeOverlays.forEach(overlay => {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                    console.log("🧹 페이드 오버레이 정리됨");
    // 페이드인 완료 후 상호작용 가능
    setTimeout(() => {
        canInteract = true;
    }, 1500);

    // 씬 정리 함수
    k.onDestroy(() => {
        // BGM은 계속 재생 (필요시에만 정지)
        // audioManager.stopBGM();
        console.log("✅ Title 씬 종료");
    });
}
