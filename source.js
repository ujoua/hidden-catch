document.addEventListener("DOMContentLoaded", () => {
    const stages = [
        { left: "images/L1.xml", right: "images/R1.jpg" },
        { left: "images/L1.xml", right: "images/R2.jpg" },
        { left: "images/L1.xml", right: "images/R1.jpg" }
    ];
    let currentStage = 0;
    let timer = null;
    let timeLeft = 180; // 3분 (초 단위)

    const lobby = document.getElementById("lobby");
    const game = document.getElementById("game");
    const ending = document.getElementById("ending");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const timerDisplay = document.getElementById("timer");

    startBtn.addEventListener("click", () => {
        lobby.style.display = "none";
        game.style.display = "block";
        currentStage = 0;
        loadStage(currentStage);
    });

    restartBtn.addEventListener("click", () => location.reload());

    function loadStage(index) {
        clearInterval(timer);
        timeLeft = 180; // 매 스테이지마다 타이머 리셋
        updateTimerDisplay();

        const { left, right } = stages[index];
        const container = document.querySelector(".canvas-container");
        container.innerHTML = "";

        fetch(left)
            .then(res => res.text())
            .then(svgText => {
                const parser = new DOMParser();
                const leftSvg = parser.parseFromString(svgText, "image/svg+xml").querySelector("svg");
                const rightSvg = leftSvg.cloneNode(true);

                // 이미지 교체
                const rightImage = rightSvg.querySelector("image");
                if (rightImage)
                    rightImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", right);

                leftSvg.id = "레이어_1";
                rightSvg.id = "레이어_2";
                container.appendChild(leftSvg);
                container.appendChild(rightSvg);

                document.getElementById("stageTitle").textContent = `Stage ${index + 1}`;
                initGame([leftSvg, rightSvg]);
                startTimer();
            });
    }

    function initGame(svgs) {
        const foundList = new Set();
        const busyIds = new Set(); // 🔒 클릭 중인 id를 잠그기 위한 집합

        svgs.forEach(svg => {
            const answers = Array.from(svg.children).slice(1);
            answers.forEach((answer, index) => {
                answer.style.fill = "transparent";
                answer.style.stroke = "none";
                answer.style.pointerEvents = "all";
                answer.dataset.id = index;
            });

            svg.addEventListener("click", e => {
                if (!(e.target instanceof SVGGeometryElement)) return;
                const id = e.target.dataset.id;
                if (!id) return;

                // 🧷 이미 찾은 곳 or 잠금 중이면 즉시 return
                if (foundList.has(id) || busyIds.has(id)) return;

                // 🔒 잠금 추가 — 다른 클릭 이벤트가 들어와도 무시됨
                busyIds.add(id);

                // 바로 pointer-events 해제 (물리적 클릭 차단)
                const sameIdShapes = [];
                svgs.forEach(s => {
                    const shape = s.querySelector(`[data-id="${id}"]`);
                    if (shape) {
                        shape.style.pointerEvents = "none";
                        sameIdShapes.push(shape);
                    }
                });

                // 논리적으로 정답 추가
                foundList.add(id);

                // 시각적 효과: 중심 좌표 기준 원 그리기
                sameIdShapes.forEach(shape => {
                    const svgEl = shape.ownerSVGElement;
                    const bbox = shape.getBBox();
                    const cx = bbox.x + bbox.width / 2;
                    const cy = bbox.y + bbox.height / 2;
                    drawCircle(svgEl, cx, cy);
                });

                // 🔓 모든 처리 완료 후 잠금 해제 (사실상 필요 없지만 안전하게)
                busyIds.delete(id);

                if (foundList.size === answers.length) {
                    clearInterval(timer);
                    alert("🎯 스테이지 클리어!");
                    nextStage();
                }
            });
        });
    }

    function nextStage() {
        currentStage++;
        if (currentStage < stages.length) loadStage(currentStage);
        else showEnding();
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert("⏰ 시간 종료!");
                showEnding();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const min = Math.floor(timeLeft / 60);
        const sec = String(timeLeft % 60).padStart(2, "0");
        timerDisplay.textContent = `⏱ ${min}:${sec}`;
    }

    function showEnding() {
        game.style.display = "none";
        ending.style.display = "block";
    }

    function getSvgPoint(svg, event) {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
    }

    function drawCircle(svg, x, y) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 100);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "red");
        circle.setAttribute("stroke-width", "20");
        svg.appendChild(circle);
    }
});
