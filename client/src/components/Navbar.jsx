import React, { useContext, useEffect, useState } from 'react';
import "../styles/Navbar.css";
import { BiHomeAlt } from "react-icons/bi";
import { BsChatSquareText } from "react-icons/bs";
import { CgAddR } from "react-icons/cg";
import { TbNotification } from "react-icons/tb";
import navProfile from '../images/nav-profile.avif';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const {isCreatPostOpen, setIsCreatePostOpen, setIsCreateStoryOpen, isNotificationsOpen, setNotificationsOpen, notifications} = useContext(GeneralContext);

  const navigate = useNavigate();
  const profilePic = localStorage.getItem('profilePic');
  const userId = localStorage.getItem('userId');
  
   return (
    <div className="Navbar">
        <BiHomeAlt className="homebtn btns" onClick={()=> navigate('/')} />
        <BsChatSquareText  className="chatbtn btns" onClick={()=> navigate('/chat')} />
        <CgAddR className="createPostbtn btns" onClick={()=> {setIsCreatePostOpen(!isCreatPostOpen); setIsCreateStoryOpen(false)}} />
        <div style={{position: 'relative', display: 'inline-block'}}>
            <TbNotification className="Notifybtn btns" onClick={()=> setNotificationsOpen(!isNotificationsOpen)}/>
            {notifications.length > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ff3b30',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '11px'
                }}>
                    {notifications.length}
                </span>
            )}
        </div>
        <img className="profile" src={profilePic} alt="" onClick={()=> navigate(`/profile/${userId}`)} />
    </div>
  )
}
export default Navbar