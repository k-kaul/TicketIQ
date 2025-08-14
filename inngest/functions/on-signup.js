import { inngest } from "../client";
import User from '../../models/user'
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer";

export const onUserSignUp = inngest.createFunction(
    { id: "om-user-signup", retries:5 },
    { event: "user/signup" },

    async ({ event,step }) => {
        try {
            const {email} = event.data;
            const user = await step.run('get-user-email', async() => {
                const userObject = await User.findOne({ email });
                if(!userObject){
                    throw new NonRetriableError("User does not exist in Db")
                }
                return userObject;
            })
            
            await step.run("send-welcome-email", async () => {
                const subject = "Welcome to the app";
                const message = `Hi, 
                \n\n
                Thanks for Signing Up.
                `
                await sendMail(user.email, subject, message)
            })

            return {success: true}

        } catch (error) {
            console.error("Error running email step", error.message)
            return {success: false}
        }
    }
)