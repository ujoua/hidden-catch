const canvas_left = document.getElementById('canvas-left');
const canvas_right = document.getElementById('canvas-right');

const context_left = canvas_left.getContext('2d');
const context_right = canvas_right.getContext('2d');

// const context_right = { context_left, context_right };

// 1. 사진
const img_left = new Image();
img_left.src = 'images/1_left.jpg';
img_left.onload = () => { context_left.drawImage(img_left, 0, 0, canvas_right.width, canvas_right.height); };

const img_right = new Image();
img_right.src = 'images/1_right.jpg';
img_right.onload = () => {
    context_right.drawImage(img_right, 0, 0, canvas_right.width, canvas_right.height);

    // 2. 틀린 곳 좌표 뽑기
    // 원 그리기
    // context_right.beginPath();              // 경로 시작
    // context_right.arc(1300, 183, 200, 0, Math.PI * 2); // 중심 (150,150), 반지름 50, 전체 원
    // context_right.strokeStyle = 'red';   // 선 색상
    // context_right.lineWidth = 20;           // 선 두께
    // context_right.stroke();                // 테두리만 그림

    // 사각형 그리기
    // context_left.strokeStyle = 'blue';     // 선 색상
    // context_left.lineWidth = 20;            // 선 두께
    // context_left.strokeRect(1300, 180, 260, 100); // x, y, 너비, 높이

    // 경로 그리기
    let ctx = context_left;

    ctx.strokeStyle = 'blue';     // 선 색상
    ctx.lineWidth = 20;            // 선 두께
    ctx.beginPath();
    ctx.moveTo(1300, 200);       // 시작점
    ctx.lineTo(1570, 1010);         // 오른쪽 위 (기울임)
    // ctx.lineTo(220, 180);       // 오른쪽 아래
    // ctx.lineTo(120, 200);       // 왼쪽 아래
    ctx.closePath();            // 경로 닫기
    ctx.strokeStyle = 'blue';
    ctx.stroke();
};



const polygon = document.getElementById('myPolygon');

polygon.addEventListener('click', function (e) {
    alert('다각형을 클릭했습니다!');
    console.log('클릭 위치:', e.clientX, e.clientY);
});
