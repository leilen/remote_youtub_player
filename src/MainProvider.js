import React, { Component, createContext } from 'react';
import {getRole , unWrapToArray} from './utils/shared_functions'

const Context = createContext(); 

const { Provider, Consumer: MainConsumer } = Context; 

class MainProvider extends Component {
    constructor(props) {
        super(props);
        if (sessionStorage.getItem('mainContext')){
          this.state = JSON.parse(sessionStorage.getItem('mainContext'));
        }else{
          this.state = {
              nickName : '',
              roleArr : []
          }
        }
        this.actions = {
            setValue: (key,value) => {
              let storageData = sessionStorage.getItem('mainContext') ? JSON.parse(sessionStorage.getItem('mainContext')) : {};
              storageData[key] = value;
              sessionStorage.setItem("mainContext", JSON.stringify(storageData));
              this.setState({
                  [key] : value
              });
            },
            checkRole : (role) =>{
              // if (unWrapToArray(this.state.roleArr).length == 0) {
              //   this.setState({
              //     roleArr : getRole()
              //   });
              // }
              if (unWrapToArray(this.state.roleArr).length == 0) {
                return false;
              }else{
                return (this.state.roleArr[Math.floor(role / 32)] & (1 << role % 32) || (this.state.roleArr[0] & 1)) ? true : false;
              }
            },
            checkRoles : (roles) =>{
              for (let v of roles){
                if (this.actions.checkRole(v)){
                    return true;
                }
            }
            return false;
            }

        }
    }

  render() {
    const { state, actions } = this;
    const value = { state, actions };
    return (
      <Provider value={value}>
        {this.props.children}
      </Provider>
    )
  }
}
function UseConsume(WrappedComponent) {
    return function (props) {
      return (
        <MainConsumer>
          {
            (consume) => (
              <WrappedComponent
                {...props}
                consume={consume}
              />
            )
          }
        </MainConsumer>
      )
    }
}

// 내보내줍니다.
export {
  MainProvider,
  MainConsumer,
  UseConsume
};