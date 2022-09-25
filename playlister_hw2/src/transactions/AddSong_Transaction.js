import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * AddSong_Transaction
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initTitle, initArtist, initYouTubeId, initSongIndex) {
        super();
        this.app = initApp;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = initYouTubeId;
        this.songIndex = initSongIndex;
    }

    doTransaction() {
        this.app.addSong(this.title, this.artist, this.youTubeId, this.songIndex);
    }
    
    undoTransaction() {
        this.app.deleteSong(this.songIndex);
    }
}