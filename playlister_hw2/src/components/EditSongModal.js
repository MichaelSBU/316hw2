import React, { Component } from 'react';

export default class EditSongModal extends Component {
    render() {
        const {hideEditSongModalCallback, editSongCallback } = this.props;
        return (
            <div className="modal" 
            id="edit-song-modal" 
            data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-edit-song-root'>
                    <div className="modal-north">
                        Edit Song
                    </div>
                    <div className="modal-center">
                        <div id = "edit-title">
				            Title:
				            <input className="edit-stuff" type="text" id="edit-title-text"></input>
			            </div>
			            <div id="edit-artist">
				            Artist:
				            <input className="edit-stuff" type="text" id="edit-artist-text"></input>
			            </div>
			            <div id="edit-youTubeId">
				            youTubeId:
				            <input className="edit-stuff" type="text" id="edit-youTubeId-text"></input>
			            </div>
                    </div>
                    <div className="modal-south">
                        <input type="button" 
                            id="edit-song-confirm-button" 
                            className="modal-button" 
                            onClick={editSongCallback}
                            value='Confirm' />
                        <input type="button" 
                            id="edit-song-cancel-button" 
                            className="modal-button" 
                            onClick={hideEditSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
                
            </div>
        );
    }
}