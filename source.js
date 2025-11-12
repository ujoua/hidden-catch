document.addEventListener("DOMContentLoaded", () => {
    const stages = [
        { left: "images/L1.xml", right: "images/R1.jpg" },
        { left: "images/L1.xml", right: "images/R2.jpg" },
        { left: "images/L1.xml", right: "images/R1.jpg" }
    ];
    let currentStage = 0;
    let timer = null;
    let timeLeft = 180; // 총 3분
    let timerStarted = false;
    let gameEnded = false; // 🚨 타이머 종료 후 중복 처리 방지

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

        if (!timerStarted) {
            startTimer();
            timerStarted = true;
        }
    });

    restartBtn.addEventListener("click", () => location.reload());

    function loadStage(index) {
        const { left, right } = stages[index];
        const container = document.querySelector(".svg-container");
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
            });
    }

    function initGame(svgs) {
        const foundList = new Set();
        const busyIds = new Set();

        svgs.forEach(svg => {
            const answers = Array.from(svg.children).slice(1);
            answers.forEach((answer, index) => {
                answer.style.fill = "transparent";
                answer.style.stroke = "none";
                answer.style.pointerEvents = "all";
                answer.dataset.id = index;
            });

            svg.addEventListener("click", e => {
                if (gameEnded) return; // 🚫 타이머 끝난 후 클릭 무효

                const target = e.target;
                if (!(target instanceof SVGGeometryElement)) {
                    // 틀린 곳 클릭 시 10초 차감
                    timeLeft = Math.max(0, timeLeft - 10);
                    flashTimerRed();
                    updateTimerDisplay();
                    return;
                }

                const id = target.dataset.id;
                if (!id) return;
                if (foundList.has(id) || busyIds.has(id)) return;
                busyIds.add(id);

                // pointer-events 비활성화
                svgs.forEach(s => {
                    const shape = s.querySelector(`[data-id="${id}"]`);
                    if (shape) shape.style.pointerEvents = "none";
                });

                foundList.add(id);

                // 중심 좌표로 원 표시
                const bbox = target.getBBox();
                const cx = bbox.x + bbox.width / 2;
                const cy = bbox.y + bbox.height / 2;
                svgs.forEach(s => drawCircle(s, cx, cy));

                busyIds.delete(id);

                if (foundList.size === answers.length) {
                    setTimeout(() => {
                        alert("🎯 스테이지 클리어!");
                        nextStage();
                    }, 500); // 300ms 정도 기다리면 원이 보임
                }
            });
        });
    }

    function nextStage() {
        if (gameEnded) return;
        currentStage++;
        if (currentStage < stages.length) {
            loadStage(currentStage);
        } else {
            clearInterval(timer);
            showEnding("clear");
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (!gameEnded) {
                    gameEnded = true;
                    showEnding("timeout");
                }
                return;
            }
            timeLeft--;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const min = Math.floor(timeLeft / 60);
        const sec = String(timeLeft % 60).padStart(2, "0");
        timerDisplay.textContent = `⏱ ${min}:${sec}`;
    }

    function flashTimerRed() {
        timerDisplay.classList.add("flash");
        setTimeout(() => timerDisplay.classList.remove("flash"), 500);
    }

    function showEnding(reason = "clear") {
        gameEnded = true;
        game.style.display = "none";
        ending.style.display = "block";

        const title = ending.querySelector("h1");
        const msg = ending.querySelector("p");

        if (reason === "timeout") {
            title.textContent = "⏰ 시간 종료!";
            msg.textContent = "아쉽네요. 다음엔 더 빠르게 찾아보세요!";
        } else {
            title.textContent = "🎉 모든 스테이지 클리어!";
            msg.textContent = "축하합니다! 완벽한 관찰력이네요!";
        }
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
