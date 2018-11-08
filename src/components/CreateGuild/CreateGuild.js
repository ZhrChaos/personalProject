import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { v4 as randomString } from 'uuid'
import { GridLoader } from 'react-spinners'
import Dropzone from 'react-dropzone';
import backArrow from './backArrow.png';
import './CreateGuild.css'

class CreateGuild extends Component {
      constructor() {
            super()
            this.state = {
                  account: {},
                  isUploading: false,
                  images: [],
                  url: 'http://via.placeholder.com/200',
                  value: '',
                  name: '',
            }
      }


      //=====================================
      getSignedRequest = ([file]) => {
            this.setState({ isUploading: true })
            // We are creating a file name that consists of a random string, and the name of the file that was just uploaded with the spaces removed and hyphens inserted instead. This is done using the .replace function with a specific regular expression. This will ensure that each file uploaded has a unique name which will prevent files from overwriting other files due to duplicate names.
            const fileName = `${randomString()}-${file.name.replace(/\s/g, '-')}`

            // We will now send a request to our server to get a "signed url" from Amazon. We are essentially letting AWS know that we are going to upload a file soon. We are only sending the file-name and file-type as strings. We are not sending the file itself at this point.
            axios.get('/api/sign-s3', {
                  params: {
                        'file-name': fileName,
                        'file-type': file.type
                  }
            }).then((response) => {
                  const { signedRequest, url } = response.data
                  this.uploadFile(file, signedRequest, url)
            }).catch(err => {
                  console.log(err)
            })
      }

      uploadFile = (file, signedRequest, url) => {

            var options = {
                  headers: {
                        'Content-Type': file.type
                  }
            };

            axios.put(signedRequest, file, options)
                  .then(response => {
                        this.setState({ isUploading: false, url: url })
                        // THEN DO SOMETHING WITH THE URL. SEND TO DB USING POST REQUEST OR SOMETHING
                  })
                  .catch(err => {
                        this.setState({
                              isUploading: false
                        })
                        if (err.response.status === 403) {
                              alert('Your request for a signed URL failed with a status 403.')
                        } else {
                              alert(`ERROR: ${err.status}\n ${err.stack}`)
                        }
                  })
      }

      // =================================

      backArrow() {
            this.props.history.push("/")
      }

      handleCreate() {
            axios.put('/api/create', {
                  img: this.state.url,
                  account: this.props.account,
                  name: this.state.name,

            })
            this.setState({ url: 'http://via.placeholder.com/200', name: '' })
            alert("Created new Guild")
      }

      handleName(e) {
            this.setState({ name: e.target.value })
      }

      render() {
            return (
                  <div className="background-div">
                        <div className="create-container">
                              <div className="header-container">
                                    <img src={backArrow} alt="back arrow" className="back-arrow" onClick={() => this.backArrow()} />
                                    <div>CreateGuild</div>
                              </div>
                              <div className="body-container">
                                    <div>{this.props.account.account_name}</div>
                                    <input onChange={(e) => this.handleName(e)} placeholder="Enter guild name" />
                                    <div className="url-wrapper">
                                          <img src={this.state.url} alt="Guild" />
                                    </div>
                                    <Dropzone
                                          onDropAccepted={this.getSignedRequest}
                                          accept='image/*'
                                          multiple={false} >

                                          {this.state.isUploading
                                                ? <GridLoader />
                                                : <p>Drop File or Click Here</p>
                                          }
                                    </Dropzone>
                                    <button className="acceptbtn" onClick={() => this.handleCreate()}>Create</button>
                              </div>
                        </div>
                  </div>
            )
      }
}

function mapStateToProps(state) {
      return {
            account: state.account
      }
}

export default connect(mapStateToProps)(CreateGuild)