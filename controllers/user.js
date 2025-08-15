import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import User from "../models/user";
import {inngest} from "../inngest/client";
import user from '../models/user';
import user from '../models/user';

export const signup = async (req, res) => {
    const {email, password, skills=[]} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            skills
        })

        //calling inngest event 

        await inngest.send({
            name: "user/signup", //name of the event in inngest function for this particular event
            data: {
                email
            }
        })

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        )

        res.json({
            user, //remove in prod
            token
        })

    } catch (error) {
        res.status(500).json({message: 'Signup Failed', error })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await user.findOne({ email })

        if(!user){
            return res.status(404).json({ message: "User not found" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch){
            return res.status(401).json({ message: "Invalid credentials" })
        }
        
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        )

        res.json({
            user, //remove in prod
            token
        })

    } catch (error) {
        res.status(500).json({message: 'Login Failed', error});
    }

}

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; 
        
        if(!token){
            return res.status(401).json({ message: 'Unauthorized' })
        }

        jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).json({message: "Unauthorized"})
            }
            res.json({ message: "logout done" })
        })

    } catch (error) {
        res.status(500).json({ message: 'Logout Failed', error });
    }
}

export const updateUser = async (req, res) => {
    const { skills=[], role, email } = req.body;
    try {
        if(req.user?.role !== 'admin'){
            return res.status(403).json({ message: "Forbidden" })
        }

        const user = await User.findOne({ email })

        if(!user){
            return res.status(401).json({message:'user not found'})
        }

        await User.updateOne(
            { email },
            { skills: skills.length ? skills : user.skills, role }
        )

        return res.json({ message: "User Updated" })

    } catch (error) {
        res.status(500).json({message: 'Update Failed', error});
    }
}

export const getAllUsers = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message:'Access Forbidden' })
        }

        const allUsers = await User.find().select('-password');
        
        return res.json(allUsers)
        
    } catch (error) {
        res.status(500).json({ message: 'Fetching Users Failed', message: error.message });
    }
}