import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) =>{
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: "No token found." })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({error:"Invalid token"})
    }
}