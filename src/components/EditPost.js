import API, { graphqlOperation } from '@aws-amplify/api';
import Auth from '@aws-amplify/auth';
import React, { Component } from 'react';
import { updatePost } from '../graphql/mutations';


class EditPost extends Component {

    state = {
        show:false,
        id: "",
        postOwnerId: "",
        postOwnerUsername: "",
        postTitle: "",
        postBody: "",
        postData: {
            postTitle:this.props.postTitle,
            postBody: this.props.postBody
        }


    }

    handleModal = () => {
        this.setState({ show: !this.state.show })  //flipping show to the opposite.
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
    }

    handleTitle = event => {
        this.setState({
            postData: {...this.state.postData,
                 postTitle: event.target.value }
        })
    }   

    handleUpdatePost = async (event) => {
        event.preventDefault()

        const input = {
            id: this.props.id,
            postOwnerId: this.state.postOwnerId,
            postOwnerUsername:this.state.postOwnerUsername,
            postTitle: this.state.postData.postTitle,
            postBody: this.state.postData.postBody
        }

        await API.graphql(graphqlOperation(updatePost, { input }))

        // force close the model
        this.setState({ show: !this.state.show})
    }
    
    handleBody = event => {
        this.setState({
            postData: {...this.state.postData,
                 postBody: event.target.value }
        })
    }  


    componentDidMount = async () => {

        await Auth.currentUserInfo()
        .then(user => {
            this.setState({
                postOwnerUsername: user.attributes.sub,
                postOwnerUsername: user.username
            })
        })
    }

    render() {
        return (
            // create fragment
            <>
                {this.state.show && (
                    <div className="modal">
                        <button className="close"
                        onClick={this.handleModal}>
                            X
                        </button>

                            <form className="add-post"
                                onSubmit={(event) => this.handleUpdatePost(event)}>

                                <input style={{fontSize: "19px"}}
                                    type="text" placeholder="Title"
                                    name= "postTitle"
                                    value={this.state.postData.postTitle}
                                    onChange={this.handleTitle}
                                />

                                <input  style={{fontSize: "19px", height:"150px"}}
                                    type="text" 
                                    name= "postBody"
                                    value={this.state.postData.postBody}
                                    onChange={this.handleBody}
                                />

                                <button>Update Post</button>

                            </form>

                                

                    </div>

                )}

                <button onClick={this.handleModal}>Edit</button>
            </>
        )

    }
}

export default EditPost;