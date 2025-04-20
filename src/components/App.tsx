/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from 'react'

import { IAuth, IPost } from './props'
import Post from './Post'
import Head from './Head'
import '../styles/app.css'

const BASE_URL = 'http://localhost:8000/'

function App() {
  const [posts, setPosts] = useState<IPost[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [authTokenType, setAuthTokenType] = useState<string | null>(null)

  useEffect(() => {
    setAuthToken(window.localStorage.getItem('authToken'))
    setAuthTokenType(window.localStorage.getItem('authTokenType'))
    setUsername(window.localStorage.getItem('username'))
    setUserId(window.localStorage.getItem('userId'))
  }, [])

  useEffect(() => {
    authToken
      ? window.localStorage.setItem('authToken', authToken)
      : window.localStorage.removeItem('authToken')
    authTokenType
      ? window.localStorage.setItem('authTokenType', authTokenType)
      : window.localStorage.removeItem('authTokenType')
    username
      ? window.localStorage.setItem('username', username)
      : window.localStorage.removeItem('username')
    userId
      ? window.localStorage.setItem('userId', userId)
      : window.localStorage.removeItem('userId')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, authTokenType, userId])

  useEffect(() => {
    fetch(BASE_URL + 'post/all')
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(data => {
        setPosts(data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  const auth: IAuth = {
    authToken,
    authTokenType,
    username,
  }

  return (
    <div className='app'>
      <Head
        authToken={authToken}
        setAuthToken={setAuthToken}
        authTokenType={authTokenType}
        setAuthTokenType={setAuthTokenType}
        username={username}
        setUsername={setUsername}
        userId={userId}
        setUserId={setUserId}
      />
      <div className='app_posts'>
        {posts.map((post, idx) => (
          <Post key={idx} post={post} auth={auth} />
        ))}
      </div>
    </div>
  )
}

export default App
