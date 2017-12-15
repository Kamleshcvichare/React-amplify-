Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/ConfirmSignUp.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('SignIn');

var Footer=function Footer(props){var
theme=props.theme,onStateChange=props.onStateChange;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signIn');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Back to Sign In'))));



};var

ConfirmSignUp=function(_AuthPiece){_inherits(ConfirmSignUp,_AuthPiece);
function ConfirmSignUp(props){_classCallCheck(this,ConfirmSignUp);var _this=_possibleConstructorReturn(this,(ConfirmSignUp.__proto__||Object.getPrototypeOf(ConfirmSignUp)).call(this,
props));

_this.state={
username:null,
code:null,
error:null};


_this.confirm=_this.confirm.bind(_this);
_this.resend=_this.resend.bind(_this);return _this;
}_createClass(ConfirmSignUp,[{key:'confirm',value:function confirm()

{var _this2=this;var _state=
this.state,username=_state.username,code=_state.code;
logger.debug('Confirm Sign Up for '+username);
_Auth2.default.confirmSignUp(username,code).
then(function(data){return _this2.changeState('signedUp');}).
catch(function(err){return _this2.error(err);});
}},{key:'resend',value:function resend()

{var _this3=this;var
username=this.state.username;
logger.debug('Resend Sign Up for '+username);
_Auth2.default.resendSignUp(username).
then(function(){return logger.debug('code sent');}).
catch(function(err){return _this3.error(err);});
}},{key:'componentWillMount',value:function componentWillMount()

{
var username=this.props.authData;
if(username&&!this.state.username){this.setState({username:username});}
}},{key:'render',value:function render()

{var _this4=this;
if(!['confirmSignUp'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:80}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:81}},_I18n2.default.get('Confirm Sign Up')),
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:82}},
_react2.default.createElement(_AmplifyUI.Username,{
theme:theme,
value:this.state.username,
onChangeText:function onChangeText(text){return _this4.setState({username:text});},__source:{fileName:_jsxFileName,lineNumber:83}}),

_react2.default.createElement(_AmplifyUI.ConfirmationCode,{
theme:theme,
onChangeText:function onChangeText(text){return _this4.setState({code:text});},__source:{fileName:_jsxFileName,lineNumber:88}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Confirm'),
onPress:this.confirm,
disabled:!this.state.username||!this.state.code,__source:{fileName:_jsxFileName,lineNumber:92}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Resend a Code'),
onPress:this.resend,
disabled:!this.state.username,__source:{fileName:_jsxFileName,lineNumber:98}})),


_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:105}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:106}},this.state.error)));


}}]);return ConfirmSignUp;}(_AuthPiece3.default);exports.default=ConfirmSignUp;