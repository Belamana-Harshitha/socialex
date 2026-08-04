import React, { useContext, useState } from 'react'
import '../styles/CreatePosts.css'
import {RxCross2} from 'react-icons/rx' 
import { GeneralContext } from '../context/GeneralContextProvider'
import axios from 'axios';

const CreatePost = () => {

    const {isCreatPostOpen, setIsCreatePostOpen} = useContext(GeneralContext);
    const [postType, setPostType] = useState('photo');
    const [postDescription, setPostDescription] = useState('');
    const [postLocation, setPostLocation] = useState('');
    const [postFile, setPostFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);

    const handlePostUplload = async (e) =>{
        e.preventDefault();
        if (!postFile) {
            alert('Please choose a file to upload.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('postFile', postFile);
            formData.append('userId', localStorage.getItem('userId'));
            formData.append('userName', localStorage.getItem('username'));
            formData.append('userPic', localStorage.getItem('profilePic'));
            formData.append('fileType', postType);
            formData.append('description', postDescription);
            formData.append('location', postLocation);

            const response = await axios.post('http://localhost:6001/createPost', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            console.log('CreatePost response', response.data);
            setPostDescription('');
            setPostLocation('');
            setPostFile(null);
            setUploadProgress(null);
            setIsCreatePostOpen(false);
            window.location.reload();
        } catch (err) {
            console.log('CreatePost error', err.response || err);
        }
    }



  return (
    <>
        <div className="createPostModalBg" style={isCreatPostOpen? {display: 'contents'} : {display: 'none'}} >
            <div className="createPostContainer">
               
                <RxCross2 className='closeCreatePost' onClick={()=> setIsCreatePostOpen(false)} />
                <h2 className="createPostTitle">Create post</h2>
                <hr className="createPostHr" />
                
                <div className="createPostBody">
                    <form>

                    <select className="form-select" aria-label="Select Post Type" onChange={(e)=> setPostType(e.target.value)}  >
                        <option defaultValue='photo'>Choose post type</option>
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                    </select>

                        <div className="uploadBox">
                            <input type="file" name="PostFile" id="uploadPostFile" onChange={(e)=> setPostFile(e.target.files[0])} />
                        </div>
                        <div className="form-floating mb-3 authFormInputs descriptionInput">
                            <input type="text" className="form-control descriptionInput" id="floatingDescription" placeholder="Description" 
                                                                    onChange={(e)=> setPostDescription(e.target.value)} value={postDescription}  /> 

                            <label htmlFor="floatingDescription">Description</label>
                        </div>
                        <div className="form-floating mb-3 authFormInputs postLocation">
                            <input type="text" className="form-control  postLocation" id="floatingLocation" placeholder="Location" 
                                                                    onChange={(e)=> setPostLocation(e.target.value)}  value={postLocation}  /> 
                                                                    
                            <label htmlFor="floatingLocation">Location</label>
                        </div>
                        {uploadProgress ?
                            <button disabled>Uploading... {Math.round(uploadProgress)}%</button>
                        :
                        <button onClick={handlePostUplload}>Upload</button>
                        }
                    </form>
                </div>
            </div>
        </div>
    </>
  )
}

export default CreatePost