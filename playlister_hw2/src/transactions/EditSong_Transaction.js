import jsTPS_Transaction from "../../common/jsTPS.js"
/**
 * EditSong_Transaction
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initSongIndex, initNewTitle, initNewArtist, initNewYouTubeId, initOldTitle, initOldArtist, initOldYouTubeId) {
        super();
        this.model = initModel;
        this.songIndex = initSongIndex;
        this.newTitle = initNewTitle;
        this.newArtist = initNewArtist;
        this.newYouTubeId = initNewYouTubeId;
        this.oldTitle = initOldTitle;
        this.oldArtist = initOldArtist;
        this.oldYouTubeId = initOldArtist;
    }

    doTransaction() {
        this.model.editSong(this.newTitle, this.newArtist, this.newYouTubeId, this.songIndex);
    }
    
    undoTransaction() {
        this.model.editSong(this.oldTitle, this.oldArtist, this.oldYouTubeId, this.songIndex);
    }
}