
import Controller from "./Controller.js";


const app = new Controller('gamescreen', 60, 70);



var audio = new Audio('../assets/mainTheme.mp3');
var audioOn = false;
document.getElementById('son').onclick = () => {
    if (!audioOn){
    audio.volume = 0.2
    audio.play();
    audioOn = true;
    }
    else {
        audio.pause();
        audioOn = false;
    }
}
audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);