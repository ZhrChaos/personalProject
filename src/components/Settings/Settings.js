import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { v4 as randomString } from 'uuid'
import { GridLoader } from 'react-spinners'
import "./settings.css"
import backArrow from './backArrow.png';
import Dropzone from 'react-dropzone';

class Settings extends Component {
      constructor() {
            super()
            this.state = {
                  isUploading: false,
                  images: [],
                  url: 'http://via.placeholder.com/450x450',
                  value: ''
            }
      }

      componentDidMount() {
            this.setUrl()
      }

      setUrl() {
            this.setState({ url: this.props.account.account_img })
      }

      // ===============================================
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
      // ===================================================

      acceptChange = () => {
            axios.put('/api/image', { url: this.state.url }).then(console.log("posted"))
      }

      backArrow() {
            this.props.history.push("/")
      }

      logout() {
            axios.get('/auth/logout')
                  .then(this.backArrow())
      }

      render() {
            // console.log(this.props)
            return (
                  <div className="settings-window">
                        <div className="settings-box">
                              <div className="top-bar">
                                    <img src={backArrow} alt="Back" className="back-arrow" onClick={() => this.backArrow()} />
                                    <div>Settings</div>
                                    <button className="logout" onClick={() => this.logout()}>Log Out</button>
                              </div>
                              <div className="account-box">
                                    <div>{this.props.account.account_name}</div>
                                    <div className="settings-image">
                                          <img src={this.state.url} alt="account" />
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
                                    <button className="accept" onClick={() => this.acceptChange()} >Accept changes</button>
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

export default connect(mapStateToProps)(Settings)