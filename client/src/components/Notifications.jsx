import React, { useContext } from 'react'
import '../styles/Notifications.css'
import {RxCross2} from 'react-icons/rx' 
import { GeneralContext } from '../context/GeneralContextProvider'

const Notifications = () => {

    const {isNotificationsOpen, setNotificationsOpen, notifications} = useContext(GeneralContext);

  return (
    <>
        <div className="notificationsModalBg" style={isNotificationsOpen? {display: 'contents'} : {display: 'none'}} >
            <div className="notificationsContainer">
               
                <RxCross2 className='closenotifications' onClick={()=> setNotificationsOpen(false)} />
                <h2 className="notificationsTitle">Notifications</h2>
                <hr className="notificationsHr" />
                
                <div className="notificationsBody">
                    {notifications.length === 0 ? (
                        <p>No new notifications</p>
                    ) : (
                        notifications.map((notification, index) => (
                            <div className="notificationItem" key={`${notification.type}-${index}`}>
                                <p>{notification.message}</p>
                                <span className="notificationTime">
                                    {notification.date ? new Date(notification.date).toLocaleString() : ''}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </>
  )
}

export default Notifications;