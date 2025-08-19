import {inngest} from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
    try {
        const {title, description} = req.body;
        
        if(!title || !description){
            return res.status(400).json({ message: 'Title and description are missing' })
        }

        //creating ticket
        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString()
        })

        await inngest.send({
            name: "ticket/created",
            data: {
                ticketId: newTicket._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()
            }
        })

        return res.status(201).json({ 
            message: 'Ticket Created and processing started',
            ticket: newTicket
        })

    } catch (error) {
        console.error("error creating ticket", error.message)
        return res.status(500).json({ message: 'Error in creating ticket' })
    }
}

export const getAllTickets = async (req, res) => {
    try {
        const user = req.user;

        let allTickets = [];

        //grabbing all ticket only if the role is not user
        if(user.role !== 'user'){
            allTickets = Ticket.find({})
            .populate("assignedTo", ["email", "_id"])
            .sort({createdAt: -1})
        } else {
            //grabbing all tickets specific to that user
            allTickets = await Ticket.find({ createdBy: user._id })
                    .select("title description status createdAt")
                    .sort({createdAt: -1})
        }

        return res.status(200).json(allTickets);

    } catch (error) {
        console.error("Error fetching tickets", error.message);
    }
}

export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;

        if(user.role !== "user"){
            ticket = Ticket.findById(req.params._id)
                .populate("assignedTo", ['email', '_id'])
        } else {
            ticket = Ticket.findOne({
                createdBy: user._id,
                _id: req.params._id
            }).select("title description status createdAt")
        }

        if(!ticket){
            return res.status(404).json({ message: "Ticket not found" })
        }

        return res.json({ ticket });

    } catch (error) {
        console.error("Error fetching tickets", error.message);
    }
}