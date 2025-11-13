document.addEventListener("DOMContentLoaded", () => {
    const stages = [
        { level: "images/1.xml", left: "images/1L.jpg", right: "images/1R.jpg" },
        { level: "images/2.xml", left: "images/2L.jpg", right: "images/2R.jpg" },
        { level: "images/3.xml", left: "images/3L.jpg", right: "images/3R.jpg" },
    ];
    let currentStage = 0;

    let timer = null;
    let timeLeft = 180;
    let timerStarted = false;
    let gameEnded = false;

    const starting = document.getElementById("starting");
    const game = document.getElementById("game");
    const ending = document.getElementById("ending");

    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const timerDisplay = document.getElementById("timer");

    startBtn.addEventListener("click", () => {
        starting.style.display = "none";
        game.style.display = "block";

        currentStage = 0;
        loadStage(currentStage);

        if (!timerStarted) {
            startTimer();
            timerStarted = true;
        }
    });

    restartBtn.addEventListener("click", () => location.reload());

    function loadStage(index) { // 정답, 이미지 로딩 
        const { level, left, right } = stages[index];
        const leftSvg = document.getElementById("leftSvg");
        const rightSvg = document.getElementById("rightSvg");

        const leftImage = leftSvg.querySelector("image");
        const rightImage = rightSvg.querySelector("image");

        leftImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", left);
        rightImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", right);

        const leftShapeGroup = document.getElementsByClassName("shapeGroup")[0];
        const righttShapeGroup = document.getElementsByClassName("shapeGroup")[1];

        fetch(level)
            .then(res => res.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svgEl = svgDoc.querySelector("svg");
                const shape = Array.from(svgEl.querySelectorAll("svg > *")).slice(1);

                // leftImage.after(...shape);
                // rightImage.after(...shape.map(el => el.cloneNode(true)));

                const shapeString = shape.map(el => el.outerHTML).join("\n");
                leftShapeGroup.innerHTML = shapeString;
                righttShapeGroup.innerHTML = shapeString;

                document.getElementById("stageTitle").textContent = `Stage ${index + 1}`;
                initGame([leftSvg, rightSvg]);
            });
    }

    function initGame(svgs) { // 정답 작업
        const foundList = new Set();
        const busyIds = new Set();
        const leftCircleGroup = document.getElementsByClassName("circleGroup")[0];
        const rightCircleGroup = document.getElementsByClassName("circleGroup")[1];
        leftCircleGroup.innerHTML = "";
        rightCircleGroup.innerHTML = "";

        svgs.forEach(svg => {
            const shapeGroup = svg.getElementsByClassName("shapeGroup")[0];
            const answers = Array.from(shapeGroup.children);
            answers.forEach((answer, index) => {
                answer.style.fill = "transparent";
                answer.style.stroke = "none";
                answer.style.pointerEvents = "all";
                answer.dataset.id = index;
            });

            svg.addEventListener("click", e => {
                if (gameEnded) return;

                const target = e.target;
                if (!(target instanceof SVGGeometryElement)) {
                    timeLeft = Math.max(0, timeLeft - 10);
                    flashTimerRed();
                    updateTimer();
                    return;
                }

                const id = target.dataset.id;
                if (!id) return;
                if (foundList.has(id) || busyIds.has(id)) return;
                busyIds.add(id);

                svgs.forEach(s => {
                    const shape = s.querySelector(`[data-id="${id}"]`);
                    if (shape) shape.style.pointerEvents = "none";
                });

                foundList.add(id);

                const point = getSvgPoint(svg, e);
                svgs.forEach(s => drawCircle(s, point.x, point.y));

                busyIds.delete(id);

                if (foundList.size === answers.length) {
                    setTimeout(() => {
                        alert("🎯 스테이지 클리어!");
                        nextStage();
                    }, 500);
                }
            });
        });
    }

    function nextStage() {
        if (gameEnded) return;

        ++currentStage;
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
            updateTimer();
        }, 1000);
    }

    function updateTimer() {
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

        svg.getElementsByClassName("circleGroup")[0].appendChild(circle);
    }
});
