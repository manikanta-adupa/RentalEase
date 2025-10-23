import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    status: 'idle',
    error: null,
    bootstrapped: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        loginStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.status = 'succeeded';
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.refreshToken = action.payload.refreshToken;
            //clear error
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.status = 'failed';
            state.user = null;
            state.error = action.payload;
            //clear token and refresh token
            state.token = null;
            state.refreshToken = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.status = 'idle';
            //clear error
            state.error = null;
        },
        registerStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        registerSuccess: (state, action) => {
            state.status = 'succeeded';
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.refreshToken = action.payload.refreshToken;
            //clear error
            state.error = null;
        },
        registerFailure: (state, action) => {
            state.status = 'failed';
            state.user = null;
            state.error = action.payload;
            //clear token and refresh token
            state.token = null;
            state.refreshToken = null;
        },
        bootstrapDone: (state) =>{
            state.bootstrapped = true;
        },
    }
});
export const { loginStart, loginSuccess, loginFailure, logout, bootstrapDone, registerStart, registerSuccess, registerFailure } = authSlice.actions;
export default authSlice.reducer;

//selectors
export const selectAuth = (state) => state.auth; //select the auth slice from the store
export const selectIsAuthenticated = (state) => Boolean(state.auth.token); //check if the user is authenticated



