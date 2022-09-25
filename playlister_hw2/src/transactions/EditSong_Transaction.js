import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * EditSong_Transaction
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initNewTitle, initNewArtist, initNewYouTubeId, initOldTitle, initOldArtist, initOldYouTubeId, initSongIndex) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.newTitle = initNewTitle;
        this.newArtist = initNewArtist;
        this.newYouTubeId = initNewYouTubeId;
        this.oldTitle = initOldTitle;
        this.oldArtist = initOldArtist;
        this.oldYouTubeId = initOldYouTubeId;
    }

    doTransaction() {
        this.app.editSong(this.newTitle, this.newArtist, this.newYouTubeId, this.songIndex);
    }
    
    undoTransaction() {
        this.app.editSong(this.oldTitle, this.oldArtist, this.oldYouTubeId, this.songIndex);
    }
}