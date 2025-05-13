import React, { useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'

import '../../styles/newPost.css'
import { IAuth } from '../props'
import { style } from './modal_style'

const BASE_URL = 'http://localhost:8000/'

const NewPost = ({ authToken, authTokenType, userId }: IAuth) => {
  const [image, setImage] = useState<File | null>(null)
  const [caption, setCaption] = useState('')

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const data = evt.target.files ? evt.target.files[0] : null
    if (data) {
      setImage(data)
    }
  }

  const handleUpload = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    evt?.preventDefault()
    const formData = new FormData()
    if (image) formData.append('image', image)

    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        Authorization: authTokenType + ' ' + authToken,
      }),
      body: formData,
    }

    fetch(BASE_URL + 'post/image', requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
      })
      .then((data) => {
        createPost(data.filename)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setCaption('')
        setImage(null)
        const input = document.getElementById('fileInput') as HTMLInputElement
        if (input.value) input.value = ''
      })
  }

  const createPost = (imageURL: string) => {
    const json_string = JSON.stringify({
      image_url: imageURL,
      image_url_type: 'relative',
      caption: caption,
      user_id: userId,
    })
    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        Authorization: authTokenType + ' ' + authToken,
        'content-type': 'application/json',
      }),
      body: json_string,
    }

    fetch(BASE_URL + 'post', requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(() => {
        window.location.reload()
        window.scrollTo(0, 0)
      })
      .catch((error) => console.log('Error', error))
  }

  return (
    <Box sx={style}>
      <div className="post_title">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
        />
        <Typography id="modal-modal-title" variant="h6" component="h2">
          <center>New Post</center>
        </Typography>
      </div>
      <div className="post_body">
        <TextField
          type="text"
          placeholder="Enter a caption"
          onChange={(evt) => setCaption(evt.target.value)}
          value={caption}
        />
        <br />
        <TextField type="file" id="fileInput" onChange={handleFileData} />
        <br />
        <Button className="imageupload_button" onClick={handleUpload}>
          UPLOAD
        </Button>
      </div>
    </Box>
  )
}

export default NewPost
