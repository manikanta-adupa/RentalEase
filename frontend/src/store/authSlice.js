import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
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
            //clear error
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.status = 'failed';
            state.user = null;
            state.error = action.payload;
            //clear token
            state.token = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            //clear error
            state.error = null;
        },
        bootstrapDone: (state) =>{
            state.bootstrapped = true;
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, bootstrapDone } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);



