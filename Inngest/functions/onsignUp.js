import {inngest} from "../client.js"
import user from "../../models/user.model.js"
import { NonRetriableError } from "inngest"
import  {sendmail} from "../../utils/mailer.js"

export const onUserSignup = inngest.createFunction(
    {id: "user-signup", retries: 2},
    {event: "user/signUp"},
    async({event, step}) =>{
        try {
            const {email} = event.data
            const consumer = await step.run("get-user-email", async() =>{
                const userObject = await user.findOne({email})
                if(!userObject){
                    throw new NonRetriableError("User no longer exists in our database")
                }
                return userObject
            })

            await step.run("send-welcome-email", async ()=>{
                const subject = `Welcome to the app`;
                const message = `Hi,
                \n\n
                Thanks for signing up. We are glad to have you onborad!`

                await sendmail(consumer.email, subject, message)
            })

            return {success: true}
        } catch (error) {
            console.error("Error running step ",error.message)
            return {success: false}
            
        }
    }
)