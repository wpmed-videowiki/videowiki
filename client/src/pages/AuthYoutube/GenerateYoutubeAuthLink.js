import React from 'react'
import { connect } from 'react-redux'
import { Image, Button, Checkbox, Form } from 'semantic-ui-react'
import PopupTools from 'popup-tools'
import { NotificationManager } from 'react-notifications'
import './style.css'
import authActions from '../../actions/AuthActionCreators'

class GenerateYoutubeAuthLink extends React.Component {
  state = { password: '' }

  onLogin () {
    const { dispatch } = this.props

    PopupTools.popup(
      this.props.youtubeAuthLink,
      'Connect Youtube',
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          NotificationManager.success('Youtube connected succesfully')
          dispatch(authActions.setYoutubeChannelInfo(data.channelData))
        }
      }
    )
  }

  handleSubmit = e => {
    e.preventDefault()
    const { password } = this.state
    const { dispatch } = this.props
    dispatch(authActions.generateYoutubeAuthLink({ password }))
  }
  render () {
    const { password } = this.state
    const { youtubeAuthLink, youtubeChannelInfo } = this.props

    return (
      <div className='auth-youtube-form-container'>
        {youtubeAuthLink ? (
          <div>
            <a onClick={this.onLogin.bind(this)}>Connect Channel</a>
          </div>
        ) : (
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <Form.Field>
              <label>Password</label>
              <input
                type='password'
                onChange={e => this.setState({ password: e.target.value })}
                value={password}
              />
            </Form.Field>
            <Button type='submit'>Submit</Button>
          </Form>
        )}
        {youtubeChannelInfo ? (
          <div className='channel-info'>
            <Image src={youtubeChannelInfo.thumbnail} avatar />
            <span>{youtubeChannelInfo.title}</span>
          </div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = ({ auth }) => Object.assign({}, auth)

export default connect(mapStateToProps)(GenerateYoutubeAuthLink)
