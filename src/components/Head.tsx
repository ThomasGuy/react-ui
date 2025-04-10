import React, { useState } from 'react'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'

import '../styles/head.css'
import { IAuthState } from './props'
import { style } from './modals/modal_style'
import NewPost from './modals/NewPost'

const BASE_URL = 'http://localhost:8000/'

const Head = ({
  authToken,
  setAuthToken,
  authTokenType,
  setAuthTokenType,
  username,
  setUsername,
  userId,
  setUserId,
}: IAuthState) => {
  const [login, setLogin] = useState(false)
  const [openSignUp, setOpenSignUp] = useState(false)
  const [newPost, setNewPost] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)

  const handleLogin = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    evt?.preventDefault()
    const formData = new FormData()
    formData.append('username', username as string)
    formData.append('password', password as string)
    const requestOptions = {
      method: 'Post',
      body: formData,
    }

    fetch(BASE_URL + 'login', requestOptions)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        throw res
      })
      .then(data => {
        setAuthToken(data.access_token)
        setAuthTokenType(data.token_type)
        setUserId(data.user_id)
        setUsername(data.username)
      })
      .catch(err => {
        console.log(err)
      })
    setLogin(false)
  }

  const handleLogout = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    evt.preventDefault()
    setAuthToken(null)
    setAuthTokenType(null)
    setUserId(null)
    setUsername(null)
    setPassword(null)
  }

  function handleSignUp(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    evt?.preventDefault()
    const json_string = JSON.stringify({
      username: username,
      email: email,
      password: password,
    })
    const requestOptions = {
      method: 'Post',
      headers: { 'Content-Type': 'application/json' },
      body: json_string,
    }

    fetch(BASE_URL + 'user', requestOptions)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(() => {
        // @ts-expect-error event is null
        handleLogin()
      })
      .catch(err => {
        console.log(err)
        alert(err)
      })
    setOpenSignUp(false)
  }

  return (
    <div className='head'>
      <Modal
        open={login}
        onClose={() => setLogin(false)}
        aria-labelledby='modal-modal-title'
      >
        <Box sx={style}>
          <div className='login_title'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png'
              alt='instagram'
            />
            <Typography id='modal-modal-title' variant='h6' component='h2'>
              <center>Login</center>
            </Typography>
          </div>
          <form className='login'>
            <TextField
              className='button'
              placeholder='username'
              type='text'
              value={username}
              onChange={evt => setUsername(evt.target.value)}
            />
            <br />
            <TextField
              className='button'
              placeholder='password'
              type='password'
              value={password}
              onChange={evt => setPassword(evt.target.value)}
            />
            <br />
            <Button type='submit' onClick={handleLogin}>
              Login
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
        aria-labelledby='modal-modal-title'
      >
        <Box sx={style}>
          <div className='login_title'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png'
              alt='instagram'
            />
            <Typography id='modal-modal-title' variant='h6' component='h2'>
              <center>New user</center>
            </Typography>
          </div>
          <form className='login'>
            <TextField
              className='button'
              placeholder='username'
              type='text'
              value={username}
              onChange={evt => setUsername(evt.target.value)}
            />
            <br />
            <TextField
              className='button'
              placeholder='email'
              type='text'
              value={email}
              onChange={evt => setEmail(evt.target.value)}
            />
            <br />
            <TextField
              className='button'
              placeholder='password'
              type='password'
              value={password}
              onChange={evt => setPassword(evt.target.value)}
            />
            <br />
            <Button type='submit' onClick={handleSignUp}>
              submit
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={newPost}
        onClose={() => setNewPost(false)}
        aria-labelledby='modal-modal-title'
      >
        <NewPost authToken={authToken} authTokenType={authTokenType} userId={userId} />
      </Modal>

      <img
        src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png'
        alt='instagram'
      />
      {authToken ? (
        <div>
          <Button variant='outlined' onClick={() => setNewPost(true)}>
            New Post
          </Button>
          <Button variant='outlined' onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      ) : (
        <div>
          <Button variant='outlined' onClick={() => setLogin(true)}>
            LOGIN
          </Button>
          <Button variant='outlined' onClick={() => setOpenSignUp(true)}>
            SIGNUP
          </Button>
        </div>
      )}
    </div>
  )
}

export default Head
