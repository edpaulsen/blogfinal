import React, { Component } from 'react';
import { listPosts } from '../graphql/queries'
import { API, graphqlOperation } from 'aws-amplify'
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CommentPost from './CommentPost';
import {onCreatePost, onDeletePost, onUpdatePost, onCreateComment} from '../graphql/subscriptions'
import { deletePost } from '../graphql/mutations';
import CreateCommentPost from './CreateCommentPost';

class DisplayPosts extends Component {

    state = {
        posts:[]
    }

    componentDidMount = async () => {
        this.getPosts()

        this.createPostListener = API.graphql(graphqlOperation(onCreatePost)).subscribe({
            next: postData => {
                const newPost = postData.value.data.onCreatePost
                const prevPosts = this.state.posts.filter(post => post.id !== newPost.id )

                const updatedPosts = [newPost, ...prevPosts]

                this.setState({ posts: updatedPosts })
            }
        })

        this.deletePostListener = API.graphql(graphqlOperation(onDeletePost)).subscribe({
            next: postData => {

                const deletedPost = postData.value.data.onDeletePost
                const updatedPosts = this.state.posts.filter(post => post.id !== deletedPost.id)
                this.setState({posts: updatedPosts})
            }
        })

        this.updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
        .subscribe({
             next: postData => {
                  const { posts } = this.state
                  const updatePost = postData.value.data.onUpdatePost
                  const index = posts.findIndex(post => post.id === updatePost.id) //had forgotten to say updatePost.id!
                  const updatePosts = [
                      ...posts.slice(0, index),
                     updatePost,
                     ...posts.slice(index + 1)
                    ]

                    this.setState({ posts: updatePosts})

             }
        })

    this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
        .subscribe({
             next: commentData => {
                  const createdComment = commentData.value.data.onCreateComment
                  let posts = [ ...this.state.posts]

                  for (let post of posts ) {
                       if ( createdComment.post.id === post.id) {
                            post.comments.items.push(createdComment)
                       }
                  }
                  this.setState({ posts})
             }
        })

    }

    componentWillUnmount() {
        this.createPostListener.unsubscribe()
        this.deletePostListener.unsubscribe()
        this.updatePostListener.unsubscribe()
        this.createPostCommentListener.unsubscribe()
        
    }

    getPosts =async () => {

        const result = await API.graphql(graphqlOperation(listPosts))

        this.setState({posts: result.data.listPosts.items})
//        console.log("All Post: ", JSON.stringify(result.data.listPosts.items));
//        console.log("All Post: ", (result.data.listPosts.items));
    }

    render() {

        const { posts } = this.state

        return posts.map(( post ) => {
            
            return (
                <div className="posts" style={rowStyle} key={ post.id }>
                    <h1>{post.postTitle}</h1>
                    <span style={{fontStyle: "italic",color: "#0ca5e297"}}>
                        { "Wrote by: "} {post.postOwnerUsername}
                        {" on "} 
                        <time style={{fontStyle: "italic"}}>
                            {" "}
                            {new Date(post.createdAt).toDateString()}
                        </time>
                        </span>
                        <p style={{color: "#000000"}}>
                            { post.postBody }</p>
                            <br/>
                            <span>
                                <DeletePost data={post}/>
                                <EditPost {...post} />
                            </span>

                            <span>
                                <CreateCommentPost postId={post.id} />
                                { post.comments.items.length > 0 && <span style={{fontSize:"19px", color:"gray"}}>
                                    Comments: </span>}
                                    {
                                        post.comments.items.map((comment, index) => <CommentPost key={index} commentData={comment}/>)
                                    }
                            </span>

                        
                   
                </div>
            )
        })
    }
}

const rowStyle = {
    background: '#f4f4f4',
    padding: '10px',
    border: '1px #ccc dotted',
    margin: '14px'
}

export default DisplayPosts;