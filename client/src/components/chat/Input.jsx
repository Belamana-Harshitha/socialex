import React, { useContext, useState } from 'react'
import { BiImageAdd } from 'react-icons/bi'
import { GeneralContext } from '../../context/GeneralContextProvider'
import {v4 as uuid} from 'uuid';
import axios from 'axios';

const Input = () => {

    const {socket, chatData} = useContext(GeneralContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState();
    const userId = localStorage.getItem('userId');

    const handleSend = async () =>{
      if (file){
        try {
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await axios.post('http://localhost:6001/uploadFile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
            },
          });

          const fileUrl = uploadResponse.data.fileUrl;
          const date = new Date();
          await socket.emit('new-message', {
            chatId: chatData.chatId,
            id: uuid(),
            text,
            file: fileUrl,
            senderId: userId,
            date,
          });

          setUploadProgress(null);
          setText('');
          setFile(null);
        } catch (err) {
          console.log('Chat file upload error', err.response || err);
        }
      } else {
        const date = new Date();
        await socket.emit('new-message', {
          chatId: chatData.chatId,
          id: uuid(),
          text,
          file: '',
          senderId: userId,
          date,
        });
        setText('');
      }
    }

  return (
    <div className='input' >
      <input type="text" placeholder='type something...' onChange={e => setText(e.target.value)} value={text} />
      <div className="send">
        <input type="file" style={{display : 'none'}} id='file' onChange={e=> setFile(e.target.files[0])} />
        <label htmlFor="file" style={{display:'flex'}}>
          <BiImageAdd />
          <p style={{fontSize: '12px'}}>{uploadProgress ? Math.floor(uploadProgress) + '%' : ''}</p>
        </label>
        <button onClick={handleSend} >Send</button>
      </div>
    </div>
  )
}

export default Input