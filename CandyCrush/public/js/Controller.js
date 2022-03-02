

import Model from "./Model.js";
import View from "./View.js";


export default class Controller {
    constructor( id, width, height) {
        this.model = new Model();
        this.view = new View(id, width, height);

        this.view.readyEvent.addListener ( () => { this.model.initGrid(8,8) } ); 
        this.view.animationEnded.addListener ( () => {this.model.checkExplosion()});
        this.model.drawEvent.addListener( (grid) => { this.view.drawGameScreen(grid) });
        this.model.explodeEvent.addListener ( (exploded,grid) => { this.view.sweetExplosion(exploded,grid)} );

        this.view.init();
        
    }

    



}