/**
 * Kaboom.js용 9-slice/Unity Sliced 스타일 UI 패널 컴포넌트
 * Unity의 Sliced 스프라이트와 유사한 효과를 제공
 */

/**
 * 기본 9-slice 스타일 패널 생성
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} options - 패널 옵션
 * @param {number} options.x - X 위치
 * @param {number} options.y - Y 위치
 * @param {number} options.width - 패널 너비
 * @param {number} options.height - 패널 높이
 * @param {Object} options.colors - 색상 설정
 * @param {number} options.zIndex - Z 인덱스
 * @param {string} options.tag - 태그
 * @returns {Array} 패널을 구성하는 모든 요소들
 */
export function createNineSlicePanel(k, options = {}) {
    const {
        x = 0,
        y = 0,
        width = 400,
        height = 300,
        colors = {
            main: [15, 25, 45],
            inner: [25, 35, 55],
            outerBorder: [100, 120, 200],
            innerBorder: [80, 100, 180],
            header: [40, 50, 80],
            headerLine: [100, 120, 200]
        },
        zIndex = 150,
        tag = "ui-panel",
        fixed = true
    } = options;

    const elements = [];

    // 외부 테두리 (가장 바깥쪽)
    const outerBorder = k.add([
        k.rect(width + 6, height + 6),
        k.pos(x - 3, y - 3),
        k.color(...colors.outerBorder),
        k.z(zIndex - 1),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(outerBorder);

    // 내부 테두리
    const innerBorder = k.add([
        k.rect(width + 2, height + 2),
        k.pos(x - 1, y - 1),
        k.color(...colors.innerBorder),
        k.z(zIndex - 1),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(innerBorder);

    // 메인 배경
    const mainBg = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.color(...colors.main),
        k.z(zIndex),
        ...(fixed ? [k.fixed()] : []),
        tag,
        tag + "-element",
    ]);
    elements.push(mainBg);

    // 내부 배경
    const innerBg = k.add([
        k.rect(width - 16, height - 16),
        k.pos(x + 8, y + 8),
        k.color(...colors.inner),
        k.z(zIndex),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(innerBg);

    return {
        elements,
        mainBg,
        destroy: () => elements.forEach(el => el.exists() && el.destroy())
    };
}

/**
 * 헤더가 있는 패널 생성
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} options - 패널 옵션 (createNineSlicePanel과 동일 + 헤더 관련)
 * @param {number} options.headerHeight - 헤더 높이 (기본: 60)
 * @returns {Object} 패널과 헤더 정보를 포함한 객체
 */
export function createPanelWithHeader(k, options = {}) {
    const {
        headerHeight = 60,
        colors = {
            main: [15, 25, 45],
            inner: [25, 35, 55],
            outerBorder: [100, 120, 200],
            innerBorder: [80, 100, 180],
            header: [40, 50, 80],
            headerLine: [100, 120, 200]
        },
        ...panelOptions
    } = options;

    // 기본 패널 생성
    const panel = createNineSlicePanel(k, { colors, ...panelOptions });

    const { x, y, width, zIndex = 150, tag = "ui-panel", fixed = true } = panelOptions;

    // 헤더 배경
    const headerBg = k.add([
        k.rect(width - 16, headerHeight),
        k.pos(x + 8, y + 8),
        k.color(...colors.header),
        k.z(zIndex + 1),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    panel.elements.push(headerBg);

    // 헤더 하단 구분선
    const headerLine = k.add([
        k.rect(width - 32, 2),
        k.pos(x + 16, y + 8 + headerHeight),
        k.color(...colors.headerLine),
        k.z(zIndex + 1),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    panel.elements.push(headerLine);

    return {
        ...panel,
        headerBg,
        headerLine,
        headerArea: {
            x: x + 8,
            y: y + 8,
            width: width - 16,
            height: headerHeight
        },
        contentArea: {
            x: x + 24,
            y: y + 8 + headerHeight + 12,
            width: width - 48,
            height: options.height - headerHeight - 32
        }
    };
}

/**
 * 모던 스타일 버튼 생성
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} options - 버튼 옵션
 * @returns {Object} 버튼 요소들과 이벤트 핸들러
 */
export function createModernButton(k, options = {}) {
    const {
        x = 0,
        y = 0,
        width = 100,
        height = 40,
        text = "Button",
        fontSize = 16,
        colors = {
            bg: [60, 60, 80],
            bgHover: [80, 80, 100],
            bgPress: [40, 40, 60],
            border: [100, 100, 120],
            text: [255, 255, 255]
        },
        zIndex = 152,
        tag = "button",
        fixed = true,
        onClick = () => {},
        onHover = () => {},
        onHoverEnd = () => {}
    } = options;

    const elements = [];

    // 버튼 테두리
    const border = k.add([
        k.rect(width + 4, height + 4),
        k.pos(x - 2, y - 2),
        k.color(...colors.border),
        k.z(zIndex - 1),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(border);

    // 버튼 배경
    const bg = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.color(...colors.bg),
        k.z(zIndex),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(bg);

    // 클릭 영역
    const clickArea = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.opacity(0),
        k.z(zIndex + 1),
        ...(fixed ? [k.fixed()] : []),
        tag,
        tag + "-element",
    ]);
    elements.push(clickArea);

    // 버튼 텍스트
    const buttonText = k.add([
        k.text(text, {
            size: fontSize,
            font: "galmuri",
        }),
        k.pos(x + width / 2, y + height / 2),
        k.color(...colors.text),
        k.anchor("center"),
        k.z(zIndex + 2),
        ...(fixed ? [k.fixed()] : []),
        tag + "-element",
    ]);
    elements.push(buttonText);

    // 이벤트 핸들러
    clickArea.onHover(() => {
        bg.color = k.rgb(...colors.bgHover);
        onHover();
    });

    clickArea.onHoverEnd(() => {
        bg.color = k.rgb(...colors.bg);
        onHoverEnd();
    });

    clickArea.onClick(() => {
        bg.color = k.rgb(...colors.bgPress);
        k.wait(0.1, () => {
            bg.color = k.rgb(...colors.bgHover);
        });
        onClick();
    });

    return {
        elements,
        bg,
        clickArea,
        buttonText,
        destroy: () => elements.forEach(el => el.exists() && el.destroy()),
        setText: (newText) => { buttonText.text = newText; },
        setColor: (newColors) => {
            if (newColors.bg) bg.color = k.rgb(...newColors.bg);
            if (newColors.border) border.color = k.rgb(...newColors.border);
            if (newColors.text) buttonText.color = k.rgb(...newColors.text);
        }
    };
}

/**
 * 닫기 버튼 (X 버튼) 생성
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} options - 버튼 옵션
 * @returns {Object} 닫기 버튼 요소들
 */
export function createCloseButton(k, options = {}) {
    const {
        x = 0,
        y = 0,
        size = 36,
        colors = {
            bg: [180, 60, 60],
            bgHover: [220, 80, 80],
            border: [120, 40, 40],
            text: [255, 255, 255]
        },
        zIndex = 152,
        tag = "close-button",
        fixed = true,
        onClick = () => {}
    } = options;

    return createModernButton(k, {
        x,
        y,
        width: size,
        height: size,
        text: "✕",
        fontSize: 20,
        colors: {
            bg: colors.bg,
            bgHover: colors.bgHover,
            bgPress: [colors.bg[0] - 20, colors.bg[1] - 20, colors.bg[2] - 20],
            border: colors.border,
            text: colors.text
        },
        zIndex,
        tag,
        fixed,
        onClick: () => {
            k.play("boop-sfx", { volume: 0.4 });
            onClick();
        }
    });
}

// 파스텔톤 색상 팔레트 (부드럽고 따뜻한 느낌)
export const UI_THEMES = {
    PASTEL_BLUE: {
        main: [173, 195, 235], // 연한 파란색
        inner: [198, 218, 245], // 더 연한 파란색
        outerBorder: [126, 155, 204], // 파스텔 파란색 테두리
        innerBorder: [146, 175, 224], // 중간 파란색 테두리
        header: [153, 185, 234], // 헤더용 파스텔 파란색
        headerLine: [126, 155, 204] // 구분선용 색상
    },
    PASTEL_GREEN: {
        main: [195, 235, 173], // 연한 초록색
        inner: [218, 245, 198], // 더 연한 초록색
        outerBorder: [155, 204, 126], // 파스텔 초록색 테두리
        innerBorder: [175, 224, 146], // 중간 초록색 테두리
        header: [185, 234, 153], // 헤더용 파스텔 초록색
        headerLine: [155, 204, 126] // 구분선용 색상
    },
    PASTEL_PURPLE: {
        main: [215, 173, 235], // 연한 보라색
        inner: [235, 198, 245], // 더 연한 보라색
        outerBorder: [175, 126, 204], // 파스텔 보라색 테두리
        innerBorder: [195, 146, 224], // 중간 보라색 테두리
        header: [205, 153, 234], // 헤더용 파스텔 보라색
        headerLine: [175, 126, 204] // 구분선용 색상
    },
    PASTEL_PINK: {
        main: [235, 173, 195], // 연한 분홍색
        inner: [245, 198, 218], // 더 연한 분홍색
        outerBorder: [204, 126, 155], // 파스텔 분홍색 테두리
        innerBorder: [224, 146, 175], // 중간 분홍색 테두리
        header: [234, 153, 185], // 헤더용 파스텔 분홍색
        headerLine: [204, 126, 155] // 구분선용 색상
    },
    PASTEL_YELLOW: {
        main: [235, 228, 173], // 연한 노란색
        inner: [245, 238, 198], // 더 연한 노란색
        outerBorder: [204, 197, 126], // 파스텔 노란색 테두리
        innerBorder: [224, 217, 146], // 중간 노란색 테두리
        header: [234, 227, 153], // 헤더용 파스텔 노란색
        headerLine: [204, 197, 126] // 구분선용 색상
    },
    PASTEL_MINT: {
        main: [173, 235, 228], // 연한 민트색
        inner: [198, 245, 238], // 더 연한 민트색
        outerBorder: [126, 204, 197], // 파스텔 민트색 테두리
        innerBorder: [146, 224, 217], // 중간 민트색 테두리
        header: [153, 234, 227], // 헤더용 파스텔 민트색
        headerLine: [126, 204, 197] // 구분선용 색상
    }
};
