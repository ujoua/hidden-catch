document.addEventListener("DOMContentLoaded", () => {
    const stages = [
        { left: "images/L1.svg", right: "images/R1.jpg" },
        { left: "images/L2.svg", right: "images/R2.jpg" },
        { left: "images/L3.svg", right: "images/R3.jpg" }
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

        svgs.forEach(svg => {
            const answers = Array.from(svg.children).slice(1);
            answers.forEach((shape, i) => {
                shape.style.fill = "transparent";
                shape.style.stroke = "none";
                shape.style.pointerEvents = "all";
                shape.dataset.id = i;
            });

            svg.addEventListener("click", e => {
                if (e.target instanceof SVGGeometryElement) {
                    const id = e.target.dataset.id;
                    if (foundList.has(id)) return;
                    foundList.add(id);

                    const point = getSvgPoint(svg, e);
                    svgs.forEach(s => drawCircle(s, point.x, point.y));

                    if (foundList.size === answers.length) {
                        clearInterval(timer);
                        alert("🎯 스테이지 클리어!");
                        nextStage();
                    }
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
