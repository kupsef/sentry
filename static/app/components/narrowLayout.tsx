import {Component} from 'react';
import styled from '@emotion/styled';

import {logout} from 'sentry/actionCreators/account';
import {Client} from 'sentry/api';
import {IconSentry} from 'sentry/icons';
import {t} from 'sentry/locale';

type Props = {
  showLogout?: boolean;
  maxWidth?: string;
};

class NarrowLayout extends Component<Props> {
  UNSAFE_componentWillMount() {
    document.body.classList.add('narrow');
  }

  componentWillUnmount() {
    this.api.clear();
    document.body.classList.remove('narrow');
  }

  private api = new Client();

  handleLogout = () => {
    logout(this.api).then(() => window.location.assign('/auth/login'));
  };

  render() {
    return (
      <div className="app">
        <div className="pattern-bg" />
        <div className="container" style={{maxWidth: this.props.maxWidth}}>
          <div className="box box-modal">
            <div className="box-header">
              <a href="/">
                <IconSentry size="lg" />
              </a>
              {this.props.showLogout && (
                <a className="logout pull-right" onClick={this.handleLogout}>
                  <Logout>{t('Sign out')}</Logout>
                </a>
              )}
            </div>
            <div className="box-content with-padding">{this.props.children}</div>
          </div>
        </div>
      </div>
    );
  }
}

const Logout = styled('span')`
  font-size: 16px;
`;

export default NarrowLayout;
