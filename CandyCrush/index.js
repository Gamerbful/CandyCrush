const gs = document.getElementById('gamescreen');

gs.width = 60* window.innerWidth / 100;
gs.height = 70 * window.innerHeight / 100;
const ctx = gs.getContext('2d');
ctx.width = gs.clientWidth;
ctx.height = gs.clientHeight;
ctx.font = "13px Arial";


