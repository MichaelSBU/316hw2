import jsTPS_Transaction from "../../common/jsTPS.js"
/**
 * DeleteSong_Transaction
 */
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initTitle, initArtist, initYouTubeId, initSongIndex) {
        super();
        this.model = initModel;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = initYouTubeId;
        this.songIndex = initSongIndex;
    }

    doTransaction() {
        this.model.deleteSong(this.songIndex);
    }
    
    undoTransaction() {
        this.model.addNewSong(this.title, this.artist, this.youTubeId, this.songIndex);
    }
}