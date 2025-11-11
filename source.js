document.addEventListener("DOMContentLoaded", () => {
    const svgs = document.querySelectorAll("svg");
    const foundList = new Set();

    // 각 SVG의 polygon/rect/path 등을 수집
    svgs.forEach(svg => {
        const answers = Array.from(svg.children).slice(1);

        answers.forEach((answer, index) => {
            answer.style.fill = "transparent";
            answer.style.stroke = "none";
            answer.style.pointerEvents = "all";

            answer.dataset.id = index;
        });

        svg.addEventListener("click", e => {
            const point = getSvgPoint(svg, e);

            if (e.target instanceof SVGGeometryElement) {
                const id = e.target.dataset.id;

                if (foundList.has(Number(id))) {
                    console.log("이미 찾은 부분입니다.");
                    return;
                }
                else {
                    foundList.add(Number(id));
                    console.log("틀린 부분을 찾았습니다!");
                }

                svgs.forEach(targetSvg => drawCircle(targetSvg, point.x, point.y));

                if (foundList.size === answers.length) {
                    alert("🎉 모든 틀린 부분을 찾았습니다!!!");
                }
            } else {
                // 틀린 클릭
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
        svg.appendChild(circle);
    }
});
