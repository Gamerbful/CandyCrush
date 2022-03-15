

import Model from "./Model.js";
import View from "./View.js";


export default class Controller {
    constructor( id, width, height) {
        this.model = new Model();
        this.view = new View(id, width, height,8,8);

        this.view.readyEvent.addListener ( (size) => { this.model.initGrid(size) } ); 
        this.view.animationEnded.addListener ( () => {this.model.checkExplosion()});
        this.model.drawEvent.addListener( (grid) => { this.view.drawGameScreen(grid) });
        this.model.explodeEvent.addListener ( (exploded,grid) => { this.view.sweetExplosion(exploded,grid)} );
        this.view.updateGrid.addListener ( (grid) => { this.model.updateGrid(grid)});
        this.model.stableEvent.addListener ( () => this.view.cancelMove() );

        this.view.init();
        let checkBox = document.getElementById("skin")
        checkBox.onclick = () => {
            if ( checkBox.checked ){
                this.view.skin = 1;
            }
            else {
                this.view.skin = 0;
            }

        }
        
    }

    



}