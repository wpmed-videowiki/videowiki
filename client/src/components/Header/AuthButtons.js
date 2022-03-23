import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'
import PopupTools from 'popup-tools'
import { NotificationManager } from 'react-notifications'
import authActions from '../../actions/AuthActionCreators'
class AuthButtons extends Component {
  onLogin () {
    PopupTools.popup(
      '/auth/wiki',
      'Wiki Connect',
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          console.log(' login response ', err, data)
          const { dispatch } = this.props
          dispatch(authActions.setToken({ token: data.token }))
          dispatch(authActions.setUser({ user: data.user }))
          dispatch(authActions.validateSession())
          NotificationManager.success(
            'Awesome! You can now upload files to VideoWiki directly from your computer.'
          )
          setTimeout(() => {
            window.location.reload()
          }, 3000)
          if (this.props.onAuth) {
            this.props.onAuth()
          }
        }
      }
    )
  }

  onLoginNCCommons () {
    PopupTools.popup(
      '/auth/wiki/nccommons',
      'NCCommons Connect',
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          console.log(' login response ', err, data)
          const { dispatch } = this.props
          dispatch(authActions.setToken({ token: data.token }))
          dispatch(authActions.setUser({ user: data.user }))
          dispatch(authActions.validateSession())
          NotificationManager.success(
            'Awesome! You can now upload files to VideoWiki directly from your computer.'
          )
          setTimeout(() => {
            window.location.reload()
          }, 3000)
          if (this.props.onAuth) {
            this.props.onAuth()
          }
        }
      }
    )
  }

  render () {
    const { onAuth, dispatch, noMargen, ...rest } = this.props
    return (
      <div className={noMargen ? '' : 'c-auth-buttons'}>
        {this.props.target === 'nccommons' ? (
          <Button
            {...rest}
            primary
            className='c-auth-buttons__signup'
            onClick={this.onLoginNCCommons.bind(this)}
          >
            Register / Login with NC Commons
          </Button>
        ) : (
          <Button
            {...rest}
            primary
            className='c-auth-buttons__signup'
            onClick={this.onLogin.bind(this)}
          >
            Register / Login with Wikipedia
          </Button>
        )}
      </div>
    )
  }
}

AuthButtons.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onAuth: PropTypes.func,
  noMargen: PropTypes.bool
}

AuthButtons.defaultProps = {
  onAuth: () => {},
  noMargen: false
}

export default connect()(AuthButtons)
