document.addEventListener("DOMContentLoaded", () => {
    const svgs = document.querySelectorAll("svg");
    const foundList = new Set();
    let gameOver = false;

    svgs.forEach(svg => {
        const answers = Array.from(svg.children).slice(1);

        answers.forEach((answer, index) => {
            answer.style.fill = "transparent";
            answer.style.stroke = "none";
            answer.style.pointerEvents = "all";

            answer.dataset.id = index;
        });

        svg.addEventListener("click", e => {
            if (gameOver) return; // 게임 종료 후 클릭 무시

            const point = getSvgPoint(svg, e);

            if (e.target instanceof SVGGeometryElement) {
                const id = e.target.dataset.id;

                if (foundList.has(Number(id))) {
                    console.log("이미 찾은 부분입니다.");
                    return;
                } else {
                    foundList.add(Number(id));
                    console.log("틀린 부분을 찾았습니다!");
                }

                svgs.forEach(targetSvg => drawCircle(targetSvg, point.x, point.y));

                if (foundList.size === answers.length) {
                    gameOver = true;
                    clearInterval(timerInterval); // 타이머 정지
                    alert("🎉 모든 틀린 부분을 찾았습니다!!!");
                }
            } else {
                console.log("여긴 틀린 부분이 아닙니다.");
            }
        });
    });

    // SVG 좌표계에 맞게 마우스 좌표 변환
    function getSvgPoint(svg, event) {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
    }

    // 클릭한 지점에 원 그리기
    function drawCircle(svg, x, y) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 100);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "red");
        circle.setAttribute("stroke-width", "20");
        circle.style.pointerEvents = "none";
        svg.appendChild(circle);
    }

    // -------------------------------
    // 카운트다운 타이머
    // -------------------------------
    let timeLeft = 180; // 3분
    const timerDisplay = document.createElement("div");
    timerDisplay.style.position = "fixed";
    timerDisplay.style.top = "10px";
    timerDisplay.style.left = "50%";
    timerDisplay.style.transform = "translateX(-50%)";
    timerDisplay.style.fontSize = "24px";
    timerDisplay.style.fontWeight = "bold";
    document.body.appendChild(timerDisplay);

    function updateTimer() {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
        const seconds = String(timeLeft % 60).padStart(2, "0");
        timerDisplay.textContent = `Time: ${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver = true;
            alert("⏰ 시간이 종료되었습니다!");
        }
        timeLeft--;
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
});
