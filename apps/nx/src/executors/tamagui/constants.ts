export const replaceReactNativeWeb = {
  esm: {
    from: 'from "react-native"',
    to: 'from "react-native-web"'
  },
  cjs: {
    from: 'require("react-native")',
    to: 'require("react-native-web")'
  }
};
