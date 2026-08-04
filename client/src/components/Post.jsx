import React, { useContext, useEffect, useState } from 'react';
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { FaGlobeAmericas } from "react-icons/fa";
import {IoIosPersonAdd} from 'react-icons/io'
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';

const Post = () => {

    const navigate = useNavigate();
    const {socket} = useContext(GeneralContext);
    const [posts, setPosts] = useState([]);
    const [following, setFollowing] = useState(localStorage.getItem('following') || '');
    const currentUserId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetchPosts();
      }, []);
      const fetchPosts = async () => { 
        try {
          const response = await axios.get('http://localhost:6001/fetchAllPosts');
          const fetchedPosts = response.data;
          setPosts(fetchedPosts);
        } catch (error) {
          console.error(error);
        }
      };

    //   Like

    const handleLike = (userId, postId) =>{
        socket.emit('postLiked', {userId, postId});
    }
    const handleUnLike = (userId, postId) =>{
        socket.emit('postUnLiked', {userId, postId});
    }

    const handleFollow = async (userId) =>{
        socket.emit('followUser', {ownId: localStorage.getItem('userId'), followingUserId: userId});
    }

    const [comment, setComment] = useState('');
    const handleComment = (postId, username)=>{
        socket.emit('makeComment', {postId, username, userId: currentUserId, comment});
        setComment('');
    }

    useEffect(() => {
        const handlePostUpdated = ({ post }) => {
            setPosts((prevPosts) => prevPosts.map((p) => p._id === post._id ? post : p));
        };

        const handleFollowingUpdated = ({ following }) => {
            localStorage.setItem('following', following);
            setFollowing(following);
        };

        socket.on('postUpdated', handlePostUpdated);
        socket.on('userFollowed', handleFollowingUpdated);
        socket.on('userUnFollowed', handleFollowingUpdated);

        return () => {
            socket.off('postUpdated', handlePostUpdated);
            socket.off('userFollowed', handleFollowingUpdated);
            socket.off('userUnFollowed', handleFollowingUpdated);
        };
    }, [socket]);

  return (
    <div className='postsContainer'>

    {posts ? posts.map((post) => {

        return(

        <div className="Post" key={post._id}>

        <div className="postTop">
            <div className="postTopDetails">
                <img src={post.userPic} alt="" className="userpic" />
                <h3 className="usernameTop" onClick={()=> navigate(`/profile/${post.userId}`)}>{post.userName}</h3>
            </div>

            {following.includes(post.userId) || currentUserId === post.userId ?
            <></>
            :
            <IoIosPersonAdd style={{cursor: "pointer"}} id='addFriendInPost' onClick={()=>handleFollow(post.userId)} />
             }

        </div>

        { post.fileType === 'photo'?
                <img src={post.file} className='postimg' alt="" />
                :
                <video id="videoPlayer" className='postimg' controls autoPlay muted>
                    <source src={post.file} />
                </video>
                }

        <div className="postReact">
            <div className="supliconcol">

                {
                    post.likes.includes(localStorage.getItem('userId')) ?
                    <AiTwotoneHeart className='support reactbtn'  onClick={() => handleUnLike(localStorage.getItem('userId'), post._id)}/>
                    :
                    <AiOutlineHeart className='support reactbtn'  onClick={() => handleLike(localStorage.getItem('userId'), post._id)}/>
                }
                
                <label htmlFor="support" className='supportCount'>{post.likes.length}</label>
            </div>
            {/* <BiCommentDetail className='comment reactbtn' /> */}
            {/* <FiSend className='share reactbtn' onClick={()=> {handleShare(post)}} /> */}
            <div className="placeiconcol">
                <FaGlobeAmericas className='placeicon reactbtn' name='place' />
                <label htmlFor="place" className='place'>{post.location}</label>
            </div>
        </div>

        <div className="detail">
            <div className='descdataWithBtn'>
                <label htmlFor='username' className="desc labeldata" id='desc'> 
                    <span style={{fontWeight: 'bold'}}>
                        {post.userName}
                    </span> 
                        &nbsp;   {post.description}
                </label>
            </div>
        </div>
        <div className="commentsContainer">
            <div className="makeComment">
                <input type="text" placeholder='type something...' onChange={(e)=>setComment(e.target.value)}/>
                {comment.length === 0 ?
                    <button className='btn btn-primary' disabled>comment</button>
                :
                    <button className='btn btn-primary' onClick={()=>handleComment(post._id, localStorage.getItem('username'))} >comment</button>
                }
            </div>
            <div className="commentsBody">
                <div className="comments">
                    {(post.comments || []).map((comment)=>{
                        return(
                            <p key={comment[0] + comment[1]}><b>{comment[0]}</b> {comment[1]}</p>
                        )
                    })}
                </div>
            </div>
        </div>
        </div>
        )

    }) : <></>}

    </div>
  )
}

export default Post