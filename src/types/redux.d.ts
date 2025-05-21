import { RootState } from '../store/rootReducer';

declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}
