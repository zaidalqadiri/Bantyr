import jwt from "jsonwebtoken"
export const generateToken = (userId, res) => {

    const token = jwt.sign({userId}, process.env.JWT_secret, {
        expiresIn:"7d"
    })

    // send token to user as a cookie
    res.cookie("jwt", token,{
        maxAge: 7 * 24 * 60 * 60 * 1000,  // milliseconds 
        httpOnly: true,  // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict",  // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development"
    });

    return token;
};
