export interface IUserSignup {
    name: string;
    email: string;
    password: string;
}

export interface IUserLogin {
    email: string;
    password: string; 
}

export interface IUserRes {
    token: string;
}