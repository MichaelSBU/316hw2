import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';


// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            SongIndexMarked : null,
            currentList : null,
            modalOpen : false,
            sessionData : loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            modalOpen : prevState.modalOpen
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            modalOpen : prevState.modalOpen
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }

    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : null,
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs,
            },
            modalOpen : prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.setState(prevState => ({
                SongIndexMarked : prevState.SongIndexMarked,
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                currentList: prevState.currentList,
                sessionData: prevState.sessionData,
                modalOpen : prevState.modalOpen
            }), () => {});
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.setState(prevState => ({
                SongIndexMarked : prevState.SongIndexMarked,
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                currentList: prevState.currentList,
                sessionData: prevState.sessionData,
                modalOpen : prevState.modalOpen
            }), () => {});
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }

    deleteMarkedSong = () => {
        let songBeingDeleted = this.state.currentList.songs[this.state.SongIndexMarked];
        this.addDeleteSongTransaction(songBeingDeleted.title, songBeingDeleted.artist, songBeingDeleted.youTubeId, this.state.SongIndexMarked);
        this.hideDeleteSongModal();
        this.setState(prevState => ({
            SongIndexMarked : null,
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            modalOpen : prevState.modalOpen
        }),() => { 
        });
    }


    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A SONG.
    deleteSong = (index) => {
        let currList = this.state.currentList;
        currList.songs.splice(index, 1);
        this.setStateWithUpdatedList(currList);
    }

    

    editMarkedSong = () => {
        let title = document.getElementById("edit-song-modal-title-textfield").value;
        let artist = document.getElementById("edit-song-modal-artist-textfield").value;
        let id = document.getElementById("edit-song-modal-youTubeId-textfield").value;
        let songBeingEdited = this.state.currentList.songs[this.state.SongIndexMarked];
        this.addEditSongTransaction(title, artist, id, songBeingEdited.title, songBeingEdited.artist, songBeingEdited.youTubeId, this.state.SongIndexMarked);
        this.hideEditSongModal();
    }

    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A SONG.
    editSong = (title, artist, youTubeId, index) => {
        let currList = this.state.currentList;
        currList.songs[index] = {title, artist, youTubeId}
        this.setStateWithUpdatedList(currList);
    }

    //THIS FUNCTION BEGINS THE PROCESS OF ADDING A SONG.
    addSong = (songName, artistName, youTubeIdOfSong, index) => {
        if(this.state.currentList !== null){
            this.state.currentList.songs.splice(index, 0, {title: songName, artist: artistName, youTubeId: youTubeIdOfSong});
            this.setStateWithUpdatedList(this.state.currentList);
        }
    }

    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION ADDS A AddSong_Transaction TO THE TRANSACTION STACK
    addAddSongTransaction = (title, artist, youTubeId, index) => {
        let transaction = new AddSong_Transaction(this, title, artist, youTubeId, index);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION ADDS A DeleteSong_Transaction TO THE TRANSACTION STACK
    addDeleteSongTransaction = (title, artist, youTubeId, index) => {
        let transaction = new DeleteSong_Transaction(this, title, artist, youTubeId, index);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION ADDS A EditSong_Transaction TO THE TRANSACTION STACK
    addEditSongTransaction = (newTitle, newArtist, newYouTubeId, oldTitle, oldArtist, oldYouTubeId, index) => {
        let transaction = new EditSong_Transaction(this, newTitle, newArtist, newYouTubeId, oldTitle, oldArtist, oldYouTubeId, index);
        this.tps.addTransaction(transaction);
    }
    
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    markSongForDeletion = (index) => {
        this.setState(prevState => ({
            SongIndexMarked : index,
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }

    markSongForEdit = (index) => {
        this.setState(prevState => ({
            SongIndexMarked : index,
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            modalOpen : prevState.modalOpen
        }), () => {
            let song = this.state.currentList.songs[index];
            document.getElementById("edit-song-modal-title-textfield").value = song.title;
            document.getElementById("edit-song-modal-artist-textfield").value = song.artist;
            document.getElementById("edit-song-modal-youTubeId-textfield").value = song.youTubeId;
            // PROMPT THE USER
            this.showEditSongModal();
        });
    }

    toggleModal() {
        this.setState(prevState => ({
            SongIndexMarked : prevState.SongIndexMarked,
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            modalOpen : !prevState.modalOpen
        }), () => {
        });
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.toggleModal();
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () =>{
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.toggleModal();
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE SONG
    showDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.toggleModal();
    }

    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.toggleModal();
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO EDIT THE SONG
    showEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.toggleModal();
    }

    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.toggleModal();
    }

    handleKeyPress = (event) => {
        if(event.ctrlKey){
            if(event.keyCode === 90 && this.tps.hasTransactionToUndo()){
                this.undo();
            }
            if(event.keyCode === 89 && this.tps.hasTransactionToRedo()){
                this.redo();
            }
        }
    }

   componentDidMount(){
        document.addEventListener("keydown", (event) => {
            if (event.ctrlKey){
                if(event.key === 'z' && this.tps.hasTransactionToUndo()){
                    this.undo();
                }
                if(event.key === 'y' && this.tps.hasTransactionToRedo()){
                    this.redo();
                }
            }
            this.setState(prevState => ({
                SongIndexMarked : prevState.SongIndexMarked,
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                currentList : prevState.currentList,
                sessionData : prevState.sessionData,
                modalOpen : prevState.modalOpen
            }), () => {
            });
          });
    }

    render() {
        let canAddList = this.state.currentList === null;
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo() && this.state.currentList !== null;
        let canRedo = this.state.currentList !== null && this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        if(this.state.modalOpen){
            canAddList = false;
            canAddSong = false;
            canUndo = false;
            canRedo = false
            canClose = false;
        }
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList={canAddList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    currentList={this.state.currentList}
                    addSongCallback={this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    index={this.state.SongIndexMarked}
                    moveSongCallback={this.addMoveSongTransaction}
                    deleteSongCallback={this.markSongForDeletion} 
                    editSongCallback={this.markSongForEdit}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    currentList={this.state.currentList}
                    index={this.state.SongIndexMarked}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                    deleteSongCallback={this.deleteMarkedSong}
                />
                <EditSongModal
                    currentList={this.state.currentList}
                    index={this.state.SongIndexMarked}
                    hideEditSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.editMarkedSong}
                />
            </div> 
        );
    }
}

export default App;
